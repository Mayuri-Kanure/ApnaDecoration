import { Capacitor, CapacitorHttp } from "@capacitor/core";

/**
 * API fetch that uses native HTTP on Android/iOS (bypasses WebView CORS/SSL issues).
 */
export async function apiFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { ...(options.headers || {}) };

  if (Capacitor.isNativePlatform()) {
    const httpOptions = {
      url,
      method,
      headers,
      connectTimeout: 30000,
      readTimeout: 30000,
    };

    if (options.body) {
      httpOptions.data =
        typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body;
    }

    const response = await CapacitorHttp.request(httpOptions);
    const data =
      typeof response.data === "string"
        ? (() => {
            try {
              return JSON.parse(response.data);
            } catch {
              return response.data;
            }
          })()
        : response.data;

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => data,
    };
  }

  return fetch(url, options);
}

export function getApiErrorMessage(data, fallback = "Request failed. Please try again.") {
  if (!data) return fallback;
  if (data.errors?.length) {
    const first = data.errors[0];
    return typeof first === "string" ? first : first.msg || first.message || fallback;
  }
  if (data.message) return data.message;
  if (data.error) return data.error;
  return fallback;
}

export function getNetworkErrorMessage(error, fallback) {
  if (!error) return fallback || "Request failed. Please try again.";
  if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
    return "Cannot reach server. Check mobile internet and try again.";
  }
  return error.message || fallback || "Request failed. Please try again.";
}
