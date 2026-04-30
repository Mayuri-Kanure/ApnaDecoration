const API_CONFIG = {
  development: {
    BASE_URL: "https://admin-api.apnadecoration.com/api",
  },
  production: {
    BASE_URL: "https://admin-api.apnadecoration.com/api",
  },
};

const getApiConfig = () => {
  const environment = process.env.NODE_ENV || "production";
  console.log("🔍 API Environment:", environment);
  return API_CONFIG[environment];
};

export const API_BASE_URL = getApiConfig().BASE_URL;
