const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:10000',
  appEnv: import.meta.env.VITE_APP_ENV || 'development'
};

export default config;
