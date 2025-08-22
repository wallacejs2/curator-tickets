import React from 'react';

export const EmailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 16 16"
    {...props}
  >
    <path d="M2 3.5a.5.5 0 01.5-.5h11a.5.5 0 01.5.5V4l-6 3.5L2 4v-.5z"/>
    <path d="M2 5.3V12.5a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V5.3l-5.5 3.2-5.5-3.2z"/>
  </svg>
);