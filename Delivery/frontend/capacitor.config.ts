import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.apnadecoration.delivery",
  appName: "APNA Decoration - Delivery Panel",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
    allowNavigation: true,
    plugins: {
      CapacitorHttp: {
        enabled: true,
        allowUrlList: [
          "https://user-api.apnadecoration.com",
          "https://admin-api.apnadecoration.com",
        ],
      },
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
