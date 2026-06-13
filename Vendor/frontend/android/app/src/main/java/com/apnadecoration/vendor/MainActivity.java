package com.apnadecoration.vendor;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "VendorMainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "Vendor MainActivity onCreate started");
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "Vendor MainActivity onStart");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "Vendor MainActivity onResume");
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "Vendor MainActivity onPause");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.d(TAG, "Vendor MainActivity onStop");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Vendor MainActivity onDestroy");
    }
}
