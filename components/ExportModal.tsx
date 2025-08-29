import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Modal from './common/Modal.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

interface ExportModalProps {
  onClose: () => void;
  dataSources: {
    title: string;
    data: any[];
  }[];
  showToast: (message: string, type: 'success' | 'error') => void;
}

const getFieldsFromData = (data: any[]) => {
  if (data.length === 0) return [];
  const fieldSet = new Set<string>();
  data.forEach(item => {
    if (item) {
      Object.keys(item).forEach(key => fieldSet.add(key));
    }
  });
  return Array.from(fieldSet);
};

// Helper to get the display name from various entity types
const getItemName = (item: any): string => 
    item?.name || 
    item?.title || 
    (item?.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : `Item ${item.id}`);

const idFieldToEntityTypeMap: Record<string, string> = {
    'ticketIds': 'ticket',
    'projectIds': 'project',
    'taskIds': 'task',
    'meetingIds': 'meeting',
    'dealershipIds': 'dealership',
    'featureIds': 'feature',
    'linkedTicketIds': 'ticket',
    'linkedProjectIds': 'project',
    'linkedTaskIds': 'task',
    'linkedMeetingIds': 'meeting',
    'linkedDealershipIds': 'dealership',
    'linkedFeatureIds': 'feature',
};

const ExportModal: React.FC<ExportModalProps> = ({ onClose, dataSources, showToast }) => {
  const [selectedSheets, setSelectedSheets] = useState<Record<string, boolean>>({});
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({});
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [enrichData, setEnrichData] = useState(true);

  const allFieldsByTitle = useMemo(() => {
    const fieldsMap: Record<string, string[]> = {};
    dataSources.forEach(ds => {
      fieldsMap[ds.title] = getFieldsFromData(ds.data);
    });
    return fieldsMap;
  }, [dataSources]);

  const lookupMaps = useMemo(() => {
    const maps: Record<string, Map<string, any>> = {};
    dataSources.forEach(ds => {
        // e.g., maps['projects'] -> maps['project']
        const key = ds.title.toLowerCase().replace(/s$/, '').replace('standalone task', 'task');
        maps[key] = new Map(ds.data.map(item => [item.id, item]));
    });
    return maps;
  }, [dataSources]);

  useEffect(() => {
    const newSelectedFields = { ...selectedFields };
    let updated = false;
    Object.keys(selectedSheets).forEach(title => {
      if (selectedSheets[title] && !newSelectedFields[title]) {
        newSelectedFields[title] = allFieldsByTitle[title] || [];
        updated = true;
      }
    });
    if (updated) {
        setSelectedFields(newSelectedFields);
    }
  }, [selectedSheets, allFieldsByTitle]);


  const handleSheetToggle = (title: string) => {
    if (format === 'csv') {
        setSelectedSheets({ [title]: !selectedSheets[title] });
    } else {
        setSelectedSheets(prev => ({ ...prev, [title]: !prev[title] }));
    }
  };
  
  const handleFieldToggle = (title: string, field: string) => {
    setSelectedFields(prev => {
        const currentFields = prev[title] || [];
        const newFields = currentFields.includes(field)
            ? currentFields.filter(f => f !== field)
            : [...currentFields, field];
        return { ...prev, [title]: newFields };
    });
  };

  const handleSelectAllFields = (title: string) => {
    setSelectedFields(prev => ({ ...prev, [title]: allFieldsByTitle[title] || [] }));
  };

  const handleDeselectAllFields = (title: string) => {
    setSelectedFields(prev => ({ ...prev, [title]: [] }));
  };
  
  const handleExport = () => {
    const sheetsToExport = Object.keys(selectedSheets).filter(title => selectedSheets[title]);
    if (sheetsToExport.length === 0) {
      showToast('Please select at least one data type to export.', 'error');
      return;
    }
    if (format === 'csv' && sheetsToExport.length > 1) {
        showToast('Only one data type can be exported as CSV at a time.', 'error');
        return;
    }
    
    let hasDataToExport = false;

    const processData = (title: string) => {
        const fields = selectedFields[title] || [];
        if (fields.length === 0) return null;

        const source = dataSources.find(ds => ds.title === title);
        if (!source || source.data.length === 0) return null;

        hasDataToExport = true;
        const newHeaders = enrichData ? fields.map(f => idFieldToEntityTypeMap[f] ? f.replace(/Ids$/, 'Names').replace(/Id$/, 'Name') : f) : fields;

        const isISODateString = (value: any) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);

        const dataToExport = source.data.map(row => {
            const newRow: { [key: string]: any } = {};
            fields.forEach((field, index) => {
                let value = row[field];
                const headerField = newHeaders[index];

                if (enrichData && idFieldToEntityTypeMap[field]) {
                    const entityType = idFieldToEntityTypeMap[field];
                    const lookupMap = lookupMaps[entityType];
                    const ids = Array.isArray(value) ? value : (value ? [value] : []);
                    value = ids.map(id => lookupMap?.get(id) ? getItemName(lookupMap.get(id)) : id).join('; ');
                } else if (isISODateString(value)) {
                    value = value.split('T')[0];
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                newRow[headerField] = value;
            });
            return newRow;
        });

        return { data: dataToExport, headers: newHeaders };
    };

    const today = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
        const title = sheetsToExport[0];
        const processed = processData(title);
        if (!processed) {
            showToast(`No data or fields selected for ${title}.`, 'error');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(processed.data, { header: processed.headers });
        const csvString = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `curator_${title.replace(/\s+/g, '_')}_${today}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Export successful!', 'success');
    } else { // xlsx
        const wb = XLSX.utils.book_new();
        sheetsToExport.forEach(title => {
            const processed = processData(title);
            if (processed) {
                const ws = XLSX.utils.json_to_sheet(processed.data, { header: processed.headers });
                XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
            }
        });
        
        if (!hasDataToExport) {
            showToast('No fields selected for the chosen data types.', 'error');
            return;
        }
        XLSX.writeFile(wb, `curator_export_${today}.xlsx`);
        showToast('Export successful!', 'success');
    }
    
    onClose();
  };

    return (
        <Modal title="Export Data" onClose={onClose}>
            <div className="space-y-6">
                <p className="text-sm text-gray-600">Select the format, data types (sheets), and columns to include in your export.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Export Format</h4>
                        <div className="flex items-center gap-x-6 p-3 bg-gray-100 rounded-md">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" name="format" value="xlsx" checked={format === 'xlsx'} onChange={() => setFormat('xlsx')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                Excel (.xlsx)
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => {
                                    setFormat('csv');
                                    const firstSelected = Object.keys(selectedSheets).find(key => selectedSheets[key]);
                                    setSelectedSheets(firstSelected ? { [firstSelected]: true } : {});
                                }} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                CSV (.csv)
                            </label>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Options</h4>
                        <div className="p-3 bg-gray-100 rounded-md">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={enrichData} onChange={e => setEnrichData(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                Enrich linked data (show names instead of IDs)
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Data Types to Export</h4>
                    {format === 'csv' && <p className="text-xs text-orange-600 mb-2 -mt-1">Only one data type can be exported as CSV at a time.</p>}
                    <div className="flex gap-4 mb-3">
                        <button onClick={() => {
                            if (format === 'csv') return;
                            const allSelected: Record<string, boolean> = {};
                            dataSources.forEach(ds => allSelected[ds.title] = true);
                            setSelectedSheets(allSelected);
                        }} className="text-xs font-semibold text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline" disabled={format==='csv'}>Select All</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setSelectedSheets({})} className="text-xs font-semibold text-blue-600 hover:underline">Deselect All</button>
                    </div>

                    <div className="space-y-3">
                        {dataSources.map(source => (
                        <div key={source.title} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!selectedSheets[source.title]}
                                onChange={() => handleSheetToggle(source.title)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-controls={`fields-${source.title.replace(/\s+/g, '-')}`}
                                aria-expanded={!!selectedSheets[source.title]}
                            />
                            <span className="font-semibold text-gray-800 text-sm">{source.title} ({source.data.length})</span>
                            </label>
                            
                            {selectedSheets[source.title] && (
                            <div className="mt-3 pl-8" id={`fields-${source.title.replace(/\s+/g, '-')}`}>
                                <div className="flex gap-4 mb-2">
                                    <button onClick={() => handleSelectAllFields(source.title)} className="text-xs font-semibold text-blue-600 hover:underline">Select All Fields</button>
                                        <span className="text-gray-300">|</span>
                                    <button onClick={() => handleDeselectAllFields(source.title)} className="text-xs font-semibold text-blue-600 hover:underline">Deselect All</button>
                                </div>
                                <div className="max-h-40 overflow-y-auto border border-gray-200 bg-white rounded-md p-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                {(allFieldsByTitle[source.title] || []).map(field => (
                                    <label key={field} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={(selectedFields[source.title] || []).includes(field)}
                                        onChange={() => handleFieldToggle(source.title, field)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">{field}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="mt-8 flex justify-end items-center gap-3">
                 <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export Data</span>
                </button>
            </div>
        </Modal>
    );
};
export default ExportModal;