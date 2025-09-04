import React, { useState, useEffect, useRef } from 'react';

interface EditableTextAreaProps {
    value?: string;
    onSave: (newValue: string) => void;
    isReadOnly?: boolean;
    label: string;
    placeholder?: string;
}

const EditableTextArea: React.FC<EditableTextAreaProps> = ({ value = '', onSave, isReadOnly, label, placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);
    
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing]);
    
    const handleSave = () => {
        if (currentValue.trim() !== value.trim()) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };
    
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }

    if (isEditing) {
        return (
            <div>
                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                 <textarea
                    ref={textareaRef}
                    value={currentValue}
                    onChange={handleInput}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="block w-full bg-white text-gray-900 border border-blue-400 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none overflow-hidden"
                />
            </div>
        );
    }
    
    return (
        <div onClick={() => !isReadOnly && setIsEditing(true)} className={`group rounded-md ${!isReadOnly && 'cursor-pointer hover:bg-gray-100 p-2 -m-2'}`}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || <span className="text-gray-400 italic">{placeholder || 'N/A'}</span>}</p>
        </div>
    );
};

export default EditableTextArea;
