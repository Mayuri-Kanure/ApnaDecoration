# APNA Decoration Vendor Frontend

## 📋 Overview
This is the vendor portal for APNA Decoration where vendors can manage their products, view their order status, and track their business performance.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation
```bash
cd Vendor/frontend
npm install
```

### Development
```bash
npm start
```
Runs the app in development mode on port 3001.

### Build
```bash
npm run build
```
Builds the app for production.

## 📁 Project Structure

```
Vendor/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── pages/
│   │       └── VendorDashboard.js
│   └── package.json
└── README.md
```

## 🎯 Features

### Vendor Dashboard
- View product statistics (total, approved, pending, rejected)
- Quick access to add products and view product list
- Getting started guide for new vendors

### Planned Features
- Product management (add, edit, delete)
- Order management
- Profile management
- Analytics dashboard

## 🔗 Integration

### Backend Connection
- Connects to Admin Backend (Port 5000)
- Uses `/api/vendor-products` endpoints
- JWT authentication for vendor users

### Authentication Flow
1. Vendor logs in with email/password
2. Gets JWT token with role: 'user'
3. Can access vendor-specific endpoints
4. Cannot access admin endpoints

## 🌐 Access URLs

### Development
- http://localhost:3001

### Production
- To be configured based on deployment

## 👥 User Roles

### Vendors (role: 'user')
- Can add/edit their own products
- Can view their order status
- Cannot approve products (admin only)
- Cannot access admin dashboard

### Admins (role: 'admin')
- Full system access
- Can approve vendor products
- Can manage all products
- Can access admin dashboard

## 📊 Database Collections Used

### Vendor Products
- Collection: `vendorProducts`
- Linked to vendor via `vendor` field
- Status: pending/approved/denied

### Users
- Collection: `users`
- Vendor users have `role: 'user'`
- Admin users have `role: 'admin'`

## 🔧 Development Notes

### Current Status
- ✅ Basic vendor dashboard created
- ✅ Routing structure in place
- ⏳ Product management pages needed
- ⏳ Backend API integration needed

### Next Steps
1. Create "My Products" page
2. Create "Add Product" page
3. Connect to vendor products API
4. Implement order management
5. Add vendor profile management
