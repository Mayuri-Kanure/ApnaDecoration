const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:5000/api'
  },
  production: {
    BASE_URL: 'https://admin-api.apnadecoration.com/api'
  }
};

const getApiConfig = () => {
  // Default to production for safety
  const environment = process.env.NODE_ENV || 'production';
  return API_CONFIG[environment];
};

export const API_BASE_URL = getApiConfig().BASE_URL;
