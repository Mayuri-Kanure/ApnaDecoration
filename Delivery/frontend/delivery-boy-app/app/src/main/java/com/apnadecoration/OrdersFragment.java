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
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import java.util.ArrayList;
import java.util.List;

public class OrdersFragment extends Fragment {
    private RecyclerView ordersRecycler;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    private OrdersAdapter adapter;
    private List<Order> orders;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_orders, container, false);
        
        // Initialize views
        initViews(view);
        
        // Load orders
        loadOrders();
        
        // Setup refresh
        setupRefresh();
        
        return view;
    }
    
    private void initViews(View view) {
        ordersRecycler = view.findViewById(R.id.orders_recycler);
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh);
        progressBar = view.findViewById(R.id.progress_bar);
        
        // Setup RecyclerView
        orders = new ArrayList<>();
        adapter = new OrdersAdapter(orders, new OrdersAdapter.OnOrderClickListener() {
            @Override
            public void onOrderClick(Order order) {
                handleOrderClick(order);
            }
            
            @Override
            public void onAcceptClick(Order order) {
                acceptOrder(order);
            }
            
            @Override
            public void onRejectClick(Order order) {
                rejectOrder(order);
            }
        });
        
        ordersRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        ordersRecycler.setAdapter(adapter);
    }
    
    private void setupRefresh() {
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadOrders();
            }
        });
    }
    
    private void loadOrders() {
        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        
        // Simulate API call (replace with actual API call)
        new android.os.Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                // Load orders data
                List<Order> newOrders = getOrdersData();
                
                // Update UI
                orders.clear();
                orders.addAll(newOrders);
                adapter.notifyDataSetChanged();
                
                // Hide loading
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            }
        }, 1500);
    }
    
    private void handleOrderClick(Order order) {
        // Show order details
        OrderDetailsDialog dialog = new OrderDetailsDialog(getContext(), order);
        dialog.show();
    }
    
    private void acceptOrder(Order order) {
        // Update order status
        order.setStatus("accepted");
        adapter.notifyDataSetChanged();
        
        // Show confirmation
        android.widget.Toast.makeText(getContext(), 
            "Order accepted: " + order.getOrderId(), 
            android.widget.Toast.LENGTH_SHORT).show();
        
        // Call API to accept order
        // TODO: Implement actual API call
    }
    
    private void rejectOrder(Order order) {
        // Update order status
        order.setStatus("rejected");
        adapter.notifyDataSetChanged();
        
        // Show confirmation
        android.widget.Toast.makeText(getContext(), 
            "Order rejected: " + order.getOrderId(), 
            android.widget.Toast.LENGTH_SHORT).show();
        
        // Call API to reject order
        // TODO: Implement actual API call
    }
    
    private List<Order> getOrdersData() {
        // Simulate orders data (replace with actual API call)
        List<Order> orders = new ArrayList<>();
        
        // Available orders
        orders.add(new Order("ORD-001", "Customer A", "123 Main St", "₹150", "available", "2.5 km"));
        orders.add(new Order("ORD-002", "Customer B", "456 Oak Ave", "₹200", "available", "3.1 km"));
        orders.add(new Order("ORD-003", "Customer C", "789 Pine Rd", "₹120", "available", "1.8 km"));
        
        // In-progress orders
        orders.add(new Order("ORD-004", "Customer D", "321 Elm St", "₹180", "in_progress", "2.2 km"));
        
        return orders;
    }
    
    // Order data model
    private static class Order {
        private String orderId;
        private String customerName;
        private String address;
        private String amount;
        private String status;
        private String distance;
        
        public Order(String orderId, String customerName, String address, String amount, String status, String distance) {
            this.orderId = orderId;
            this.customerName = customerName;
            this.address = address;
            this.amount = amount;
            this.status = status;
            this.distance = distance;
        }
        
        // Getters
        public String getOrderId() { return orderId; }
        public String getCustomerName() { return customerName; }
        public String getAddress() { return address; }
        public String getAmount() { return amount; }
        public String getStatus() { return status; }
        public String getDistance() { return distance; }
        
        // Setters
        public void setStatus(String status) { this.status = status; }
    }
}
