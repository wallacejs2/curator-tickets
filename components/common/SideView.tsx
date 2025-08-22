import React, { useEffect } from 'react';
import { XIcon } from '../icons/XIcon.tsx';

interface SideViewProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  isOpen: boolean;
}

const SideView: React.FC<SideViewProps> = ({ title, onClose, children, isOpen }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl bg-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-5 bg-white border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close panel"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-grow overflow-y-auto bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideView;