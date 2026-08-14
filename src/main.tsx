import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@neondatabase/auth-ui/css';
import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import { neon } from './lib/neon';
import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <NeonAuthUIProvider authClient={neon.auth} redirectTo="/account">
        <App />
      </NeonAuthUIProvider>
    </BrowserRouter>
  </React.StrictMode>
);
