import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.apnadecoration.vendor",
  appName: "Apna Decoration Vendor",
  webDir: "build",
  server: {
    androidScheme: "https",
    cleartext: true,
    allowNavigation: [
      "admin-api.apnadecoration.com",
      "user-api.apnadecoration.com",
      "vendor-api.apnadecoration.com",
      "apnadecoration.com",
    ],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    WebView: {
      allowFileAccessFromFileURLs: true,
      allowUniversalAccessFromFileURLs: true,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
