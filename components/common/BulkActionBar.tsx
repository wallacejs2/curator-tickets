import React, { useState } from 'react';
import { Status, Priority } from '../../types.ts';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../constants.ts';
import { XIcon } from '../icons/XIcon.tsx';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onUpdateStatus: (status: Status) => void;
  onUpdatePriority: (priority: Priority) => void;
  onDelete: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onClearSelection, onUpdateStatus, onUpdatePriority, onDelete }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-blue-50 border-b-2 border-blue-200 p-3 mb-4 rounded-md shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-blue-800">{selectedCount} item(s) selected</span>
        
        {/* Status Dropdown */}
        <div className="relative">
            <button onClick={() => { setShowStatus(!showStatus); setShowPriority(false); }} className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-100">Change Status</button>
            {showStatus && (
                <div className="absolute top-full mt-1 bg-white border rounded-md shadow-lg z-20">
                    {STATUS_OPTIONS.map(status => (
                        <a key={status} href="#" onClick={(e) => { e.preventDefault(); onUpdateStatus(status); setShowStatus(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{status}</a>
                    ))}
                </div>
            )}
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
            <button onClick={() => { setShowPriority(!showPriority); setShowStatus(false); }} className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-100">Change Priority</button>
            {showPriority && (
                <div className="absolute top-full mt-1 bg-white border rounded-md shadow-lg z-20">
                    {PRIORITY_OPTIONS.map(priority => (
                         <a key={priority} href="#" onClick={(e) => { e.preventDefault(); onUpdatePriority(priority); setShowPriority(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{priority}</a>
                    ))}
                </div>
            )}
        </div>

        <button onClick={onDelete} className="text-sm text-red-600 font-medium hover:underline">Delete</button>
      </div>
      <button onClick={onClearSelection} className="p-1 rounded-full hover:bg-blue-200" aria-label="Clear selection">
        <XIcon className="w-5 h-5 text-blue-700" />
      </button>
    </div>
  );
};

export default BulkActionBar;