package com.apnadecoration;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.ProgressBar;
import android.widget.Button;
import android.widget.LinearLayout;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class EarningsFragment extends Fragment {
    private TextView totalEarningsText;
    private TextView availableBalanceText;
    private TextView todayEarningsText;
    private TextView weeklyEarningsText;
    private ProgressBar progressBar;
    private RecyclerView earningsRecycler;
    private List<Earning> earnings;
    private EarningsAdapter adapter;
    private Button withdrawButton;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_earnings, container, false);
        
        // Initialize views
        initViews(view);
        
        // Load earnings data
        loadEarningsData();
        
        // Setup earnings list
        setupEarningsList();
        
        return view;
    }
    
    private void initViews(View view) {
        totalEarningsText = view.findViewById(R.id.total_earnings_text);
        availableBalanceText = view.findViewById(R.id.available_balance_text);
        todayEarningsText = view.findViewById(R.id.today_earnings_text);
        weeklyEarningsText = view.findViewById(R.id.weekly_earnings_text);
        progressBar = view.findViewById(R.id.progress_bar);
        earningsRecycler = view.findViewById(R.id.earnings_recycler);
        withdrawButton = view.findViewById(R.id.withdraw_button);
        
        // Setup withdraw button
        withdrawButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openWithdrawalDialog();
            }
        });
    }
    
    private void loadEarningsData() {
        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        
        // Simulate API call (replace with actual API call)
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                // Load earnings data
                EarningsData data = getEarningsData();
                
                // Update UI
                totalEarningsText.setText("₹" + data.totalEarnings);
                availableBalanceText.setText("₹" + data.availableBalance);
                todayEarningsText.setText("₹" + data.todayEarnings);
                weeklyEarningsText.setText("₹" + data.weeklyEarnings);
                
                // Hide loading
                progressBar.setVisibility(View.GONE);
            }
        }, 1500);
    }
    
    private void setupEarningsList() {
        earnings = new ArrayList<>();
        earnings.add(new Earning("2026-02-20", 1250.00, "Delivery", "Completed", "ORD-001"));
        earnings.add(new Earning("2026-02-19", 980.00, "Delivery", "Completed", "ORD-002"));
        earnings.add(new Earning("2026-02-18", 1500.00, "Delivery", "Completed", "ORD-003"));
        earnings.add(new Earning("2026-02-17", 750.00, "Delivery", "Completed", "ORD-004"));
        earnings.add(new Earning("2026-02-16", 1100.00, "Delivery", "Completed", "ORD-005"));
        
        // Setup RecyclerView
        adapter = new EarningsAdapter(earnings, new EarningsAdapter.OnEarningClickListener() {
            @Override
            public void onEarningClick(Earning earning) {
                showEarningDetails(earning);
            }
        });
        
        earningsRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        earningsRecycler.setAdapter(adapter);
    }
    
    private void showEarningDetails(Earning earning) {
        // Create and show earning details dialog
        EarningDetailsDialog dialog = new EarningDetailsDialog(getContext(), earning);
        dialog.show();
    }
    
    private void openWithdrawalDialog() {
        // Create and show withdrawal dialog
        WithdrawalDialog dialog = new WithdrawalDialog(getContext(), new WithdrawalDialog.OnWithdrawalListener() {
            @Override
            public void onWithdrawalRequested(double amount) {
                processWithdrawal(amount);
            }
        });
        dialog.show();
    }
    
    private void processWithdrawal(double amount) {
        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        
        // Simulate API call (replace with actual API call)
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                // Update available balance
                double currentBalance = Double.parseDouble(availableBalanceText.getText().toString().replace("₹", ""));
                double newBalance = currentBalance - amount;
                availableBalanceText.setText("₹" + newBalance);
                
                // Hide loading
                progressBar.setVisibility(View.GONE);
                
                // Show success message
                android.widget.Toast.makeText(getContext(), 
                    "Withdrawal request of ₹" + amount + " submitted successfully!", 
                    android.widget.Toast.LENGTH_LONG).show();
                
                // Reload earnings data
                loadEarningsData();
            }
        }, 2000);
    }
    
    private EarningsData getEarningsData() {
        // Simulate data (replace with actual API call)
        EarningsData data = new EarningsData();
        data.totalEarnings = 12500;
        data.availableBalance = 8750;
        data.todayEarnings = 1250;
        data.weeklyEarnings = 6250;
        return data;
    }
    
    // Earnings data model
    private static class EarningsData {
        double totalEarnings;
        double availableBalance;
        double todayEarnings;
        double weeklyEarnings;
    }
    
    // Earning model
    private static class Earning {
        private String date;
        private double amount;
        private String type;
        private String status;
        private String orderId;
        
        public Earning(String date, double amount, String type, String status, String orderId) {
            this.date = date;
            this.amount = amount;
            this.type = type;
            this.status = status;
            this.orderId = orderId;
        }
        
        // Getters
        public String getDate() { return date; }
        public double getAmount() { return amount; }
        public String getType() { return type; }
        public String getStatus() { return status; }
        public String getOrderId() { return orderId; }
    }
}
