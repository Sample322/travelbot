import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';

// Ensure the Telegram WebApp is ready before rendering the React app.
const tg = (window as any).Telegram?.WebApp;
tg?.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);