import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

console.log('Main.jsx loading...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
    document.body.innerHTML = '<h1 style="padding: 20px; color: red;">Error: Root element not found!</h1>';
  } else {
    console.log('Root element found, rendering app...');
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
    console.log('App rendered successfully!');
  }
} catch (error) {
  console.error('Fatal error in main.jsx:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: red;">Fatal Error</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}

