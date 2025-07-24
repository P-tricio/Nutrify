
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-c6dip11dmpk3zh02.us.auth0.com"
      clientId="20H4EoMoTEqlrzCrqnWP0ISDNSIglKzo"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://nutrify-api"
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
