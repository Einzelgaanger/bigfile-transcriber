import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';
import './styles/uzima-marketing.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      richColors={false}
      offset={16}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 52px)' }}
    />
  </React.StrictMode>,
);
