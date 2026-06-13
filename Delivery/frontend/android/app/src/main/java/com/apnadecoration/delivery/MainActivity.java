package com.apnadecoration.delivery;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "DeliveryMainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "Delivery MainActivity onCreate started");

        // Force WebView configuration to prevent black screen
        try {
            getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            Log.d(TAG, "WebView soft input mode set to ADJUST_RESIZE");
            
            // Force the webview to resize instead of pan
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
                Log.d(TAG, "WebView overscroll mode set to NEVER");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set window flags", e);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "Delivery MainActivity onStart");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "Delivery MainActivity onResume");

        // Ensure WebView settings are correct
        try {
            WebView.setWebContentsDebuggingEnabled(true);
            Log.d(TAG, "WebView debugging enabled");
        } catch (Exception e) {
            Log.e(TAG, "Failed to enable WebView debugging", e);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "Delivery MainActivity onPause");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.d(TAG, "Delivery MainActivity onStop");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Delivery MainActivity onDestroy");
    }
}
