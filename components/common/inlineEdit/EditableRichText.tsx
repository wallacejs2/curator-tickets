import React, { useState, useEffect, useRef } from 'react';

interface EditableRichTextProps {
    value: string;
    onSave: (newValue: string) => void;
    isReadOnly?: boolean;
}

const EditableRichText: React.FC<EditableRichTextProps> = ({ value, onSave, isReadOnly }) => {
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && editorRef.current) {
            editorRef.current.innerHTML = value;
            editorRef.current.focus();
        }
    }, [isEditing, value]);

    const handleSave = () => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            onSave(editorRef.current.innerHTML);
        }
        setIsEditing(false);
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
    };
    
    if (isEditing) {
        return (
            <div>
                <div className="mb-2 p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md">
                    <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-sm w-8 h-8 flex items-center justify-center" aria-label="Bold">B</button>
                    <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 italic text-sm w-8 h-8 flex items-center justify-center" aria-label="Italic">I</button>
                    <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Bulleted List">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                    </button>
                    <button type="button" onClick={() => handleFormat('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Numbered List">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/><path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/><path d="M3.652 7.332v-.474H4c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/><path d="M2.24 3.862v.428h.832v-.428h.633V5.1h-.633v.569h-.832v-.569H1.41V3.862z"/>
                        </svg>
                    </button>
                    <button onClick={handleSave} className="ml-auto bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm">Save</button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    onBlur={handleSave}
                    className="w-full text-sm p-2 min-h-[200px] border border-blue-400 rounded-b-md focus:outline-none rich-text-content text-gray-900 bg-white"
                />
            </div>
        );
    }
    
    return (
        <div onClick={() => !isReadOnly && setIsEditing(true)} className={`group rounded-md ${!isReadOnly && 'cursor-pointer hover:bg-gray-100 p-2 -m-2'}`}>
            <div className="max-w-none p-4 bg-gray-50 border border-gray-200 rounded-md rich-text-content text-gray-900" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
    );
};

export default EditableRichText;