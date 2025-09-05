import React from 'react';

export const BrainCircuitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v2m0 2v2m-4-6H6m-2 0H2m12 4h2m2 0h2m-4-12V6m0-2V2" />
  </svg>
);
