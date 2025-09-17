import React, { useState, useEffect, useRef } from 'react';

interface EditableDateProps {
    value?: string;
    onSave: (newValue: string | undefined) => void;
    isReadOnly?: boolean;
    label: string;
}

const EditableDate: React.FC<EditableDateProps> = ({ value, onSave, isReadOnly, label }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value ? new Date(value).toISOString().split('T')[0] : '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentValue(value ? new Date(value).toISOString().split('T')[0] : '');
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (currentValue !== (value ? new Date(value).toISOString().split('T')[0] : '')) {
            onSave(currentValue || undefined);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value ? new Date(value).toISOString().split('T')[0] : '');
            setIsEditing(false);
        }
    };
    
    if (isEditing) {
        return (
            <div>
                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                 <input
                    ref={inputRef}
                    type="date"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="block w-full bg-white text-gray-900 border border-blue-400 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>
        );
    }

    return (
        <div onClick={() => !isReadOnly && setIsEditing(true)} className={`group rounded-md ${!isReadOnly && 'cursor-pointer hover:bg-gray-100 p-2 -m-2'}`}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
            <p className="text-sm text-gray-800 mt-1">
                {value ? new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'}
            </p>
        </div>
    );
};

export default EditableDate;