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

const ExportModal: React.FC<ExportModalProps> = ({ onClose, dataSources, showToast }) => {
  const [selectedSheets, setSelectedSheets] = useState<Record<string, boolean>>({});
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({});

  const allFieldsByTitle = useMemo(() => {
    const fieldsMap: Record<string, string[]> = {};
    dataSources.forEach(ds => {
      fieldsMap[ds.title] = getFieldsFromData(ds.data);
    });
    return fieldsMap;
  }, [dataSources]);

  // Initialize selected fields when a sheet is selected for the first time
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
    setSelectedSheets(prev => ({ ...prev, [title]: !prev[title] }));
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

  const handleSelectAll = (title: string) => {
    setSelectedFields(prev => ({ ...prev, [title]: allFieldsByTitle[title] || [] }));
  };

  const handleDeselectAll = (title: string) => {
    setSelectedFields(prev => ({ ...prev, [title]: [] }));
  };
  
  const handleExport = () => {
    const sheetsToExport = Object.keys(selectedSheets).filter(title => selectedSheets[title]);
    if (sheetsToExport.length === 0) {
      showToast('Please select at least one data type to export.', 'error');
      return;
    }
    
    const wb = XLSX.utils.book_new();
    let hasDataToExport = false;
    
    sheetsToExport.forEach(title => {
        const fields = selectedFields[title] || [];
        if (fields.length === 0) {
            return; // Skip sheets with no selected fields
        }

        const source = dataSources.find(ds => ds.title === title);
        if (!source || source.data.length === 0) {
            return; // Skip empty datasets
        }
        
        hasDataToExport = true;

        const isISODateString = (value: any) => {
            if (typeof value !== 'string') return false;
            return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
        }

        const dataToExport = source.data.map(row => {
            const newRow: { [key: string]: any } = {};
            fields.forEach(field => {
                let value = row[field];
                if (isISODateString(value)) {
                    value = value.split('T')[0];
                } else if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                newRow[field] = value;
            });
            return newRow;
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport, { header: fields });
        XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
    });
    
    if (!hasDataToExport) {
        showToast('No fields selected for the chosen data types.', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const fileName = `exportdata.${today}.xlsx`;
    
    try {
        XLSX.writeFile(wb, fileName);
        showToast('Export successful!', 'success');
        onClose();
    } catch (e) {
        console.error("Export failed: ", e);
        showToast('An error occurred during export. See console for details.', 'error');
    }
  };

    return (
        <Modal title="Export Data" onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Select the data types (sheets) and columns you want to include in your Excel export. The file will be saved as .xlsx.</p>
                {dataSources.map(source => (
                <div key={source.title} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!selectedSheets[source.title]}
                        onChange={() => handleSheetToggle(source.title)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-controls={`fields-${source.title.replace(/\s+/g, '-')}`}
                        aria-expanded={!!selectedSheets[source.title]}
                    />
                    <span className="font-semibold text-gray-800">{source.title} ({source.data.length})</span>
                    </label>
                    
                    {selectedSheets[source.title] && (
                    <div className="mt-3 pl-8" id={`fields-${source.title.replace(/\s+/g, '-')}`}>
                        <div className="flex gap-4 mb-2">
                            <button onClick={() => handleSelectAll(source.title)} className="text-xs font-semibold text-blue-600 hover:underline">Select All Fields</button>
                                <span className="text-gray-300">|</span>
                            <button onClick={() => handleDeselectAll(source.title)} className="text-xs font-semibold text-blue-600 hover:underline">Deselect All</button>
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
             <div className="mt-8 flex justify-end items-center gap-3">
                 <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export to Excel</span>
                </button>
            </div>
        </Modal>
    );
};
export default ExportModal;