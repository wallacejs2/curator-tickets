import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
    value?: string;
    onSave: (newValue: string) => void;
    isReadOnly?: boolean;
    label: string;
    placeholder?: string;
    isUrl?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({ value = '', onSave, isReadOnly, label, placeholder, isUrl = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleSave = () => {
        if (currentValue.trim() !== value.trim()) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };
    
    if (isEditing) {
        return (
            <div>
                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                 <input
                    ref={inputRef}
                    type={isUrl ? "url" : "text"}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="block w-full bg-white text-gray-900 border border-blue-400 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>
        );
    }
    
    return (
        <div onClick={() => !isReadOnly && setIsEditing(true)} className={`group rounded-md ${!isReadOnly && 'cursor-pointer hover:bg-gray-100 p-2 -m-2'}`}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
            <div className="text-sm text-gray-800 mt-1 flex items-center gap-2">
                <span>{value || <span className="text-gray-400 italic">{placeholder || 'N/A'}</span>}</span>
                {isUrl && value && (
                    <a href={value} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="font-semibold text-blue-600 hover:underline text-xs">
                        Visit Link
                    </a>
                )}
            </div>
        </div>
    );
};

export default EditableText;