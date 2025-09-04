import React, { useState, useEffect, useRef } from 'react';

interface EditableSelectProps {
    value: string;
    onSave: (newValue: string) => void;
    options: string[];
    isReadOnly?: boolean;
    label: string;
    tagColors: Record<string, string>;
}

const EditableSelect: React.FC<EditableSelectProps> = ({ value, onSave, options, isReadOnly, label, tagColors }) => {
    const [isEditing, setIsEditing] = useState(false);
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditing) {
            selectRef.current?.focus();
        }
    }, [isEditing]);
    
    const handleSave = (newValue: string) => {
        if (newValue !== value) {
            onSave(newValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };
    
    if (isEditing) {
        return (
             <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                <select
                    ref={selectRef}
                    value={value}
                    onChange={(e) => handleSave(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleKeyDown}
                    className="block w-full bg-white text-gray-900 border border-blue-400 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div onClick={() => !isReadOnly && setIsEditing(true)} className={`group rounded-md ${!isReadOnly && 'cursor-pointer hover:bg-gray-100 p-2 -m-2'}`}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${tagColors[value] || 'bg-gray-200 text-gray-800'}`}>
                {value}
            </span>
        </div>
    );
};

export default EditableSelect;
