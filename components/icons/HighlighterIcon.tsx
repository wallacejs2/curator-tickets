import React from 'react';

export const HighlighterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" {...props}>
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37L18 2h-1.41l-2.34 2.34-1.41-1.41-1.41 1.41L14.17 6 3 17.17V21h3.83L19.08 8.71l1.63-1.63c.39-.39.39-1.02 0-1.41z"/>
  </svg>
);