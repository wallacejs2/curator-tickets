import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Modal from './common/Modal.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { MenuIcon } from './icons/MenuIcon.tsx';


interface ExportModalProps {
  onClose: () => void;
  dataSources: {
    title: string;
    data: any[];
  }[];
}

const getFieldsFromData = (data: any[], title: string) => {
  if (data.length === 0) return [];
  const fieldSet = new Set<string>();
  let maxWebsiteLinks = 0;

  data.forEach(item => {
    if (item) {
      if (title === 'Dealerships' && item.websiteLinks && Array.isArray(item.websiteLinks)) {
        maxWebsiteLinks = Math.max(maxWebsiteLinks, item.websiteLinks.length);
      }
      Object.keys(item).forEach(key => {
        if (title === 'Dealerships' && key === 'websiteLinks') {
          // Skip, will be handled separately
        } else {
          fieldSet.add(key);
        }
      });
    }
  });
  
  const fields = Array.from(fieldSet);

  if (title === 'Dealerships' && maxWebsiteLinks > 0) {
    for (let i = 1; i <= maxWebsiteLinks; i++) {
      fields.push(`websiteLink${i}`);
      fields.push(`clientID${i}`);
    }
  }

  return fields;
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

const ExportModal: React.FC<ExportModalProps> = ({ onClose, dataSources }) => {
  const [selectedSheets, setSelectedSheets] = useState<Record<string, boolean>>({});
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({});
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [enrichData, setEnrichData] = useState(true);
  const [activeDataType, setActiveDataType] = useState<string>(dataSources.length > 0 ? dataSources[0].title : '');

  // Drag and drop state
  const dragField = useRef<string | null>(null);
  const dragOverField = useRef<string | null>(null);

  const allFieldsByTitle = useMemo(() => {
    const fieldsMap: Record<string, string[]> = {};
    dataSources.forEach(ds => {
      fieldsMap[ds.title] = getFieldsFromData(ds.data, ds.title);
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
    // Add nested tasks from projects to the task map
    const projectsData = dataSources.find(ds => ds.title === 'Projects')?.data || [];
    if (!maps['task']) {
        maps['task'] = new Map();
    }
    projectsData.forEach(project => {
        (project.tasks || []).forEach((task: any) => {
            if (!maps['task'].has(task.id)) {
                maps['task'].set(task.id, task);
            }
        });
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
    const isChecked = !selectedSheets[title];
    if (format === 'csv') {
        setSelectedSheets({ [title]: isChecked });
        if (isChecked) {
            setActiveDataType(title);
        }
    } else {
        setSelectedSheets(prev => ({ ...prev, [title]: isChecked }));
        if (isChecked) {
            setActiveDataType(title);
        }
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

  const handleDragStart = (field: string) => {
    dragField.current = field;
  };

  const handleDragEnter = (field: string) => {
    dragOverField.current = field;
  };

  const handleDrop = (title: string) => {
    if (!dragField.current || !dragOverField.current || dragField.current === dragOverField.current) {
        return;
    }
    const fields = selectedFields[title];
    const dragFieldIndex = fields.indexOf(dragField.current);
    const dragOverFieldIndex = fields.indexOf(dragOverField.current);
    if (dragFieldIndex === -1 || dragOverFieldIndex === -1) return;

    const newFields = [...fields];
    const [removed] = newFields.splice(dragFieldIndex, 1);
    newFields.splice(dragOverFieldIndex, 0, removed);

    setSelectedFields(prev => ({
        ...prev,
        [title]: newFields,
    }));
  };

  const handleDragEnd = () => {
    dragField.current = null;
    dragOverField.current = null;
  };
  
  const handleExport = () => {
    const sheetsToExport = Object.keys(selectedSheets).filter(title => selectedSheets[title]);
    if (sheetsToExport.length === 0) {
      // FIX: Replaced deprecated showToast with window.alert for error notification.
      window.alert('Please select at least one data type to export.');
      return;
    }
    if (format === 'csv' && sheetsToExport.length > 1) {
        // FIX: Replaced deprecated showToast with window.alert for error notification.
        window.alert('Only one data type can be exported as CSV at a time.');
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
                const headerField = newHeaders[index];
                let value;
        
                if (title === 'Dealerships' && (field.startsWith('websiteLink') || field.startsWith('clientID'))) {
                    const linkIndexMatch = field.match(/\d+$/);
                    if (linkIndexMatch) {
                        const linkIndex = parseInt(linkIndexMatch[0], 10) - 1;
                        if (row.websiteLinks && row.websiteLinks[linkIndex]) {
                            if (field.startsWith('websiteLink')) {
                                value = row.websiteLinks[linkIndex].url;
                            } else {
                                value = row.websiteLinks[linkIndex].clientId;
                            }
                        }
                    }
                } else {
                    value = row[field];
                    if (enrichData && idFieldToEntityTypeMap[field]) {
                        const entityType = idFieldToEntityTypeMap[field];
                        const lookupMap = lookupMaps[entityType];
                        const ids = Array.isArray(value) ? value : (value ? [value] : []);
                        value = ids.map(id => lookupMap?.get(id) ? getItemName(lookupMap.get(id)) : id).join('; ');
                    } else if (enrichData && field === 'updates' && Array.isArray(value)) {
                        value = value.map(update => 
                            `${new Date(update.date).toISOString().split('T')[0]} by ${update.author}: ${update.comment.replace(/<br\s*\/?>/gi, '\n')}`
                        ).join('\n\n');
                    } else if (isISODateString(value)) {
                        value = value.split('T')[0];
                    } else if (typeof value === 'object' && value !== null) {
                        value = JSON.stringify(value);
                    }
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
            // FIX: Replaced deprecated showToast with window.alert for error notification.
            window.alert(`No data or fields selected for ${title}.`);
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
        // FIX: Removed call to deprecated showToast function.
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
            // FIX: Replaced deprecated showToast with window.alert for error notification.
            window.alert('No fields selected for the chosen data types.');
            return;
        }
        XLSX.writeFile(wb, `curator_export_${today}.xlsx`);
        // FIX: Removed call to deprecated showToast function.
    }
    
    onClose();
  };
  
    const renderFieldSelection = (title: string) => {
        const allFields = allFieldsByTitle[title] || [];
        const currentSelectedFields = selectedFields[title] || [];
        const availableFields = allFields.filter(f => !currentSelectedFields.includes(f));

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {/* Available Fields Column */}
                <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Available Columns ({availableFields.length})</h5>
                    <div className="h-[50vh] overflow-y-auto border border-gray-300 bg-white rounded-md p-2 space-y-1">
                        {availableFields.length > 0 ? availableFields.map(field => (
                            <div key={field} className="flex items-center justify-between p-1.5 rounded hover:bg-gray-100">
                                <span className="text-sm text-gray-800">{field}</span>
                                <button
                                    type="button"
                                    onClick={() => handleFieldToggle(title, field)}
                                    className="text-blue-600 hover:text-blue-800 font-bold text-lg leading-none flex items-center justify-center w-5 h-5"
                                    aria-label={`Add column ${field}`}
                                >
                                    +
                                </button>
                            </div>
                        )) : <p className="text-center text-sm text-gray-500 p-4">All columns selected</p>}
                    </div>
                </div>

                {/* Selected Fields Column */}
                <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Selected &amp; Ordered ({currentSelectedFields.length})</h5>
                    <div className="h-[50vh] overflow-y-auto border border-gray-300 bg-white rounded-md p-2 space-y-1" onDragEnd={handleDragEnd}>
                        {currentSelectedFields.length > 0 ? currentSelectedFields.map(field => (
                            <div
                                key={field}
                                draggable
                                onDragStart={() => handleDragStart(field)}
                                onDragEnter={() => handleDragEnter(field)}
                                onDrop={() => handleDrop(title)}
                                onDragOver={(e) => e.preventDefault()}
                                className="flex items-center justify-between p-1.5 rounded bg-gray-50 border border-gray-200 cursor-grab group"
                            >
                                <div className="flex items-center gap-2">
                                    <MenuIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                                    <span className="text-sm text-gray-800 font-medium">{field}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleFieldToggle(title, field)}
                                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none flex items-center justify-center w-5 h-5"
                                    aria-label={`Remove column ${field}`}
                                >
                                    -
                                </button>
                            </div>
                        )) : <p className="text-center text-sm text-gray-500 p-4">Select columns from the left</p>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal title="Export Data" onClose={onClose} size="6xl">
            <div className="space-y-6">
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
                                    // For CSV, only allow one sheet. Keep the active one or the first selected.
                                    const firstSelected = Object.keys(selectedSheets).find(s => selectedSheets[s]);
                                    const sheetToKeep = activeDataType && selectedSheets[activeDataType] ? activeDataType : firstSelected;
                                    if (sheetToKeep) {
                                        setSelectedSheets({ [sheetToKeep]: true });
                                    } else {
                                        setSelectedSheets({});
                                    }
                                }} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                CSV (.csv)
                            </label>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Options</h4>
                         <div className="flex items-center p-3 bg-gray-100 rounded-md">
                             <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={enrichData} onChange={e => setEnrichData(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                                Enrich linked ID fields with names
                            </label>
                         </div>
                    </div>
                </div>

                <div className="flex">
                    {/* Data Source Selection Sidebar */}
                    <div className="w-1/4 pr-6 border-r border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Data Types to Export</h4>
                        <div className="space-y-2">
                            {dataSources.map(ds => (
                                <div key={ds.title} className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedSheets[ds.title]}
                                            onChange={() => handleSheetToggle(ds.title)}
                                        />
                                        <span className={activeDataType === ds.title ? 'font-bold text-blue-600' : 'text-gray-700'}>{ds.title}</span>
                                    </label>
                                    <button
                                        onClick={() => setActiveDataType(ds.title)}
                                        className={`text-xs font-semibold px-2 py-0.5 rounded ${activeDataType === ds.title ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Field Selection Area */}
                    <div className="w-3/4 pl-6">
                        {activeDataType && selectedSheets[activeDataType] ? (
                            <>
                                <h4 className="font-semibold text-gray-800 mb-4 text-md">Configure Columns for: <span className="text-blue-700">{activeDataType}</span></h4>
                                {renderFieldSelection(activeDataType)}
                            </>
                        ) : (
                            <div className="h-[50vh] flex items-center justify-center bg-gray-50 rounded-md">
                                <p className="text-gray-500">Select a data type on the left to configure its columns.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-green-700 disabled:bg-green-300"
                        disabled={Object.values(selectedSheets).every(v => !v)}
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;