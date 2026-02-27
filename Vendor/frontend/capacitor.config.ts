import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apnadecoration.vendor',
  appName: 'Apna Decoration Vendor',
  webDir: 'build',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    WebView: {
      allowFileAccessFromFileURLs: true,
      allowUniversalAccessFromFileURLs: true
    }
  }
};

export default config;
