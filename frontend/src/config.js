const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:10000',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  // Base URL of the frontend application. Used for Auth0 logout redirect.
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin
};

export default config;
