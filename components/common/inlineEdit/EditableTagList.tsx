import React, { useState, useEffect, useRef } from 'react';

interface EditableTagListProps {
    value?: string[];
    onSave: (newValue: string[]) => void;
    isReadOnly?: boolean;
    label: string;
}

const EditableTagList: React.FC<EditableTagListProps> = ({ value = [], onSave, isReadOnly, label }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value.join(', '));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentValue(value.join(', '));
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);
    
    const handleSave = () => {
        const newTags = currentValue.split(',').map(tag => tag.trim()).filter(Boolean);
        if (newTags.join(', ') !== value.join(', ')) {
            onSave(newTags);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value.join(', '));
            setIsEditing(false);
        }
    };
    
    if (isEditing) {
        return (
            <div>
                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                 <input
                    ref={inputRef}
                    type="text"
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
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</h4>
            <div className="flex flex-wrap gap-2">
                {value.length > 0 ? value.map(item => (
                    <span key={item} className="px-2.5 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-full">{item}</span>
                )) : <p className="text-sm text-gray-500 italic">N/A</p>}
            </div>
        </div>
    );
};

export default EditableTagList;
