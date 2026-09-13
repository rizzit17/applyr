import React from 'react';
import ReactDOM from 'react-dom/client';
import { Popup } from './Popup';
import './Popup.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
