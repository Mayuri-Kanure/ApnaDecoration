import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apnadecoration.user',
  appName: 'Apna Decoration',
  webDir: 'build',
  // Remove server.url to use bundled web assets
  // Only keep server config for cleartext traffic and navigation
  server: {
    cleartext: true,
    allowNavigation: [
      'http://10.0.2.2',
      'https://10.0.2.2',
      'http://192.168.1.64',
      'https://192.168.1.64',
      'http://localhost',
      'https://localhost'
    ],
    // Force HTTP loading to avoid mixed content issues
    androidScheme: 'http'
  },
  plugins: {
    WebView: {
      allowFileAccessFromFileURLs: true,
      allowUniversalAccessFromFileURLs: true,
      allowMixedContent: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: true,
      spinnerStyle: "large"
    }
  }
};

export default config;
