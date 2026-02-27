package com.apnadecoration;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.ProgressBar;
import android.widget.LinearLayout;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;

public class DashboardFragment extends Fragment {
    private TextView todayEarningsText;
    private TextView totalDeliveriesText;
    private TextView ratingText;
    private TextView availableBalanceText;
    private ProgressBar progressBar;
    private RecyclerView quickActionsRecycler;
    private List<QuickAction> quickActions;
    private QuickActionsAdapter adapter;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_dashboard, container, false);
        
        // Initialize views
        initViews(view);
        
        // Load dashboard data
        loadDashboardData();
        
        // Setup quick actions
        setupQuickActions();
        
        return view;
    }
    
    private void initViews(View view) {
        todayEarningsText = view.findViewById(R.id.today_earnings_text);
        totalDeliveriesText = view.findViewById(R.id.total_deliveries_text);
        ratingText = view.findViewById(R.id.rating_text);
        availableBalanceText = view.findViewById(R.id.available_balance_text);
        progressBar = view.findViewById(R.id.progress_bar);
        quickActionsRecycler = view.findViewById(R.id.quick_actions_recycler);
    }
    
    private void loadDashboardData() {
        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        
        // Simulate API call (replace with actual API call)
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                // Load dashboard data
                DashboardData data = getDashboardData();
                
                // Update UI
                todayEarningsText.setText("₹" + data.todayEarnings);
                totalDeliveriesText.setText(String.valueOf(data.totalDeliveries));
                ratingText.setText(data.rating + " ⭐");
                availableBalanceText.setText("₹" + data.availableBalance);
                
                // Hide loading
                progressBar.setVisibility(View.GONE);
            }
        }, 1500);
    }
    
    private void setupQuickActions() {
        quickActions = new ArrayList<>();
        quickActions.add(new QuickAction("Start Delivery", R.drawable.ic_delivery, "start_delivery"));
        quickActions.add(new QuickAction("View Orders", R.drawable.ic_orders, "view_orders"));
        quickActions.add(new QuickAction("Request Withdrawal", R.drawable.ic_withdrawal, "withdrawal"));
        quickActions.add(new QuickAction("Update Profile", R.drawable.ic_profile, "profile"));
        
        // Setup RecyclerView
        adapter = new QuickActionsAdapter(quickActions, new QuickActionsAdapter.OnQuickActionClickListener() {
            @Override
            public void onQuickActionClick(QuickAction action) {
                handleQuickAction(action);
            }
        });
        
        quickActionsRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        quickActionsRecycler.setAdapter(adapter);
    }
    
    private void handleQuickAction(QuickAction action) {
        switch (action.getAction()) {
            case "start_delivery":
                // Navigate to orders screen
                ((MainActivity) getActivity()).openOrders();
                break;
            case "view_orders":
                // Navigate to orders screen
                ((MainActivity) getActivity()).openOrders();
                break;
            case "withdrawal":
                // Navigate to withdrawal screen
                ((MainActivity) getActivity()).openWithdrawal();
                break;
            case "profile":
                // Navigate to profile screen
                ((MainActivity) getActivity()).openProfile();
                break;
        }
    }
    
    private DashboardData getDashboardData() {
        // Simulate data (replace with actual API call)
        DashboardData data = new DashboardData();
        data.todayEarnings = 1250;
        data.totalDeliveries = 45;
        data.rating = 4.8;
        data.availableBalance = 8750;
        return data;
    }
    
    // Dashboard data model
    private static class DashboardData {
        double todayEarnings;
        int totalDeliveries;
        double rating;
        double availableBalance;
    }
    
    // Quick action model
    private static class QuickAction {
        private String title;
        private int icon;
        private String action;
        
        public QuickAction(String title, int icon, String action) {
            this.title = title;
            this.icon = icon;
            this.action = action;
        }
        
        public String getTitle() { return title; }
        public int getIcon() { return icon; }
        public String getAction() { return action; }
    }
}
