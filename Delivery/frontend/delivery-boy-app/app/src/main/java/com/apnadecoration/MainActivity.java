package com.apnadecoration;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

public class MainActivity extends AppCompatActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Setup toolbar
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle("APNA Delivery");
        
        // Initialize dashboard
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, new DashboardFragment())
                .commit();
        }
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        switch (id) {
            case R.id.action_orders:
                openOrders();
                return true;
            case R.id.action_earnings:
                openEarnings();
                return true;
            case R.id.action_profile:
                openProfile();
                return true;
            case R.id.action_withdrawal:
                openWithdrawal();
                return true;
            case R.id.action_logout:
                logout();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
    
    private void openOrders() {
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, new OrdersFragment())
            .addToBackStack(null)
            .commit();
    }
    
    private void openEarnings() {
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, new EarningsFragment())
            .addToBackStack(null)
            .commit();
    }
    
    private void openProfile() {
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, new ProfileFragment())
            .addToBackStack(null)
            .commit();
    }
    
    private void openWithdrawal() {
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, new WithdrawalFragment())
            .addToBackStack(null)
            .commit();
    }
    
    private void logout() {
        // Clear session
        SessionManager.clearSession(this);
        
        // Show message
        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
        
        // Navigate to login
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
