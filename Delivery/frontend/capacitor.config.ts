import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.apnadecoration.delivery",
  appName: "APNA Decoration - Delivery Panel",
  webDir: "out",
  backgroundColor: "#ffffffff", // Fixes the black screen flash!

  server: {
    androidScheme: "https",
    cleartext: true,
    // FIX 1 & 2: Moved the URLs here and formatted as an array of strings
    allowNavigation: [
      "user-api.apnadecoration.com",
      "admin-api.apnadecoration.com",
    ],
  },

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
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
