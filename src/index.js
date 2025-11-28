import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { registerServiceWorker } from './utils/notificationUtils';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  registerServiceWorker().catch(err => {
    console.log('Service worker registration failed:', err);
  });
}

reportWebVitals();
