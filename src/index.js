import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Suppress React warnings in console
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: Received') ||
     args[0].includes('Warning: React does not recognize'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('PWA: Service worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('PWA: New content is available');
  }
});