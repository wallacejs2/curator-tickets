import React from 'react';

interface EditableCheckboxProps {
    value?: boolean;
    onSave: (newValue: boolean) => void;
    isReadOnly?: boolean;
    label: string;
}

const EditableCheckbox: React.FC<EditableCheckboxProps> = ({ value, onSave, isReadOnly, label }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSave(e.target.checked);
    };

    if (isReadOnly) {
        return (
            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
                <p className="text-sm text-gray-800 mt-1">{value ? 'Yes' : 'No'}</p>
            </div>
        );
    }
    
    return (
        <div className="flex items-center h-full">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                  type="checkbox"
                  checked={!!value}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">{label}</span>
            </label>
        </div>
    );
};

export default EditableCheckbox;
