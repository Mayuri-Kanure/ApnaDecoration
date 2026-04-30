import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Rule 6: Disable React StrictMode to prevent double API calls in development
// This avoids confusion but does not affect production
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);