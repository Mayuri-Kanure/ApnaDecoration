package com.apnadecoration;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import android.content.Intent;
import androidx.appcompat.app.AppCompatActivity;

public class LoginActivity extends AppCompatActivity {
    private EditText emailEditText;
    private EditText passwordEditText;
    private Button loginButton;
    private ProgressBar progressBar;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Check if already logged in
        if (SessionManager.isLoggedIn(this)) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }
        
        // Initialize views
        initViews();
        
        // Setup click listeners
        setupClickListeners();
    }
    
    private void initViews() {
        emailEditText = findViewById(R.id.email_edit_text);
        passwordEditText = findViewById(R.id.password_edit_text);
        loginButton = findViewById(R.id.login_button);
        progressBar = findViewById(R.id.progress_bar);
    }
    
    private void setupClickListeners() {
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                attemptLogin();
            }
        });
    }
    
    private void attemptLogin() {
        // Get input values
        String email = emailEditText.getText().toString().trim();
        String password = passwordEditText.getText().toString().trim();
        
        // Validate input
        if (email.isEmpty()) {
            emailEditText.setError("Email is required");
            return;
        }
        
        if (password.isEmpty()) {
            passwordEditText.setError("Password is required");
            return;
        }
        
        // Show progress
        progressBar.setVisibility(View.VISIBLE);
        loginButton.setEnabled(false);
        
        // Simulate login (replace with actual API call)
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                // For demo, accept any email/password
                if (email.contains("@") && password.length() >= 6) {
                    // Save session
                    SessionManager.saveSession(LoginActivity.this, email, "delivery-boy-123");
                    
                    // Navigate to main activity
                    Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(LoginActivity.this, 
                        "Invalid email or password", Toast.LENGTH_SHORT).show();
                }
                
                // Hide progress
                progressBar.setVisibility(View.GONE);
                loginButton.setEnabled(true);
            }
        }, 2000);
    }
}
