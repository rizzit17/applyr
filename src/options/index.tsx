import React from 'react';
import ReactDOM from 'react-dom/client';
import { Options } from './Options';
import './Options.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
}
