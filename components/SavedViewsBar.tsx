import React, { useState } from 'react';
import { SavedTicketView } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';

interface SavedViewsBarProps {
    savedViews: SavedTicketView[];
    onSaveView: (name: string) => void;
    onApplyView: (viewId: string) => void;
    onDeleteView: (viewId: string) => void;
}

const SavedViewsBar: React.FC<SavedViewsBarProps> = ({ savedViews, onSaveView, onApplyView, onDeleteView }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [viewName, setViewName] = useState('');

    const handleSave = () => {
        if (viewName.trim()) {
            onSaveView(viewName.trim());
            setViewName('');
            setIsSaving(false);
        }
    };

    return (
        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 flex-shrink-0">Saved Views:</span>
                <div className="flex items-center gap-2 flex-wrap">
                    {savedViews.map(view => (
                        <div key={view.id} className="flex items-center bg-gray-200 rounded-full">
                            <button
                                onClick={() => onApplyView(view.id)}
                                className="px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-300 rounded-l-full"
                            >
                                {view.name}
                            </button>
                            <button
                                onClick={() => onDeleteView(view.id)}
                                className="px-2 py-1 hover:bg-red-200 rounded-r-full"
                                aria-label={`Delete saved view ${view.name}`}
                            >
                                <XIcon className="w-3 h-3 text-gray-600 hover:text-red-700" />
                            </button>
                        </div>
                    ))}
                </div>
                {isSaving ? (
                     <div className="flex items-center gap-2 ml-auto">
                        <input
                            type="text"
                            value={viewName}
                            onChange={(e) => setViewName(e.target.value)}
                            placeholder="Name your view..."
                            className="p-1 border border-gray-300 rounded-md text-sm"
                            autoFocus
                        />
                        <button onClick={handleSave} className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm">Save</button>
                        <button onClick={() => setIsSaving(false)} className="text-gray-500 hover:text-gray-700 p-1">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsSaving(true)}
                        className="ml-auto flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-md text-sm hover:bg-blue-100"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Save Current View</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SavedViewsBar;