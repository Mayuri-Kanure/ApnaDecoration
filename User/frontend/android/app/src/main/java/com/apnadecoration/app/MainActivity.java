package com.apnadecoration.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";
    private WebView webView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "MainActivity onCreate started");

        try {
            // Force enable debugging for WebView
            WebView.setWebContentsDebuggingEnabled(true);
            Log.d(TAG, "WebView debugging enabled");
        } catch (Exception e) {
            Log.e(TAG, "Failed to enable WebView debugging", e);
        }

        // Log app info
        try {
            Log.d(TAG, "App Package: " + getPackageName());
            Log.d(TAG, "App Version: " + getPackageManager().getPackageInfo(getPackageName(), 0).versionName);
            Log.d(TAG, "WebView Available: " + (webView != null));
        } catch (Exception e) {
            Log.e(TAG, "Failed to get app info", e);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "MainActivity onStart");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "MainActivity onResume");

        // Check network connectivity
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
            android.net.NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            boolean isConnected = activeNetwork != null && activeNetwork.isConnectedOrConnecting();
            Log.d(TAG, "Network Connected: " + isConnected);
        } catch (Exception e) {
            Log.e(TAG, "Failed to check network connectivity", e);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "MainActivity onPause");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.d(TAG, "MainActivity onStop");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "MainActivity onDestroy");
    }
}
