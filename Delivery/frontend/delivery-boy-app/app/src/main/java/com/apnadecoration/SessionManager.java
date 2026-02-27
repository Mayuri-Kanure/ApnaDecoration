package com.apnadecoration;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

public class SessionManager {
    private static final String PREF_NAME = "APNADeliverySession";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_USER_NAME = "userName";
    
    private SharedPreferences pref;
    private Editor editor;
    private Context context;
    
    // Constructor
    public SessionManager(Context context) {
        this.context = context;
        pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = pref.edit();
    }
    
    // Create login session
    public void saveSession(Context context, String email, String userId) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_EMAIL, email);
        editor.putString(KEY_USER_ID, userId);
        editor.putString(KEY_USER_NAME, extractNameFromEmail(email));
        editor.commit();
    }
    
    // Check login status
    public static boolean isLoggedIn(Context context) {
        SharedPreferences pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        return pref.getBoolean(KEY_IS_LOGGED_IN, false);
    }
    
    // Get stored session data
    public String getEmail() {
        return pref.getString(KEY_EMAIL, "");
    }
    
    public String getUserId() {
        return pref.getString(KEY_USER_ID, "");
    }
    
    public String getUserName() {
        return pref.getString(KEY_USER_NAME, "");
    }
    
    // Clear session
    public static void clearSession(Context context) {
        SharedPreferences pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        Editor editor = pref.edit();
        editor.clear();
        editor.commit();
    }
    
    // Helper method to extract name from email
    private String extractNameFromEmail(String email) {
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf("@"));
        }
        return "User";
    }
}
