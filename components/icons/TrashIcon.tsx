import React from 'react';

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16"
    {...props}
  >
    <path d="M4.5 2.5a.5.5 0 01.5-.5h6a.5.5 0 01.5.5v1h-7v-1zM3 4.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v1h-10v-1z"/>
    <path fillRule="evenodd" d="M3.5 6a.5.5 0 01.5.5v6a1.5 1.5 0 001.5 1.5h4a1.5 1.5 0 001.5-1.5v-6a.5.5 0 011 0v6A2.5 2.5 0 019.5 15h-4A2.5 2.5 0 013 12.5v-6a.5.5 0 01.5-.5z"/>
    <path fillRule="evenodd" d="M6 7.5a.5.5 0 01.5.5v4a.5.5 0 01-1 0v-4a.5.5 0 01.5-.5zm4 0a.5.5 0 01.5.5v4a.5.5 0 01-1 0v-4a.5.5 0 01.5-.5z"/>
  </svg>
);