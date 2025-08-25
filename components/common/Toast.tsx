import React from 'react';
import { XIcon } from '../icons/XIcon.tsx';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) {
    return null;
  }

  const baseStyles = "fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between w-full max-w-sm p-4 rounded-lg shadow-lg text-white transition-all duration-300 ease-in-out";
  const typeStyles = {
    success: "bg-green-600",
    error: "bg-red-600",
  };

  const animationClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10";

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${animationClass}`} role="alert">
      <div className="text-sm font-semibold">{message}</div>
      <button onClick={onClose} aria-label="Close" className="ml-4 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
