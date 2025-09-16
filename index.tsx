

import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed to a named import as App.tsx does not have a default export.
import { App } from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);