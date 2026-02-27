# 🏪 APNA DECORATION - Complete E-Commerce Platform

A comprehensive multi-role e-commerce platform for home decoration and furniture products with separate applications for Users, Vendors, and Admins.

## 📋 Table of Contents

- [🏗️ Project Architecture](#-project-architecture)
- [🚀 Quick Start](#-quick-start)
- [📱 Applications Overview](#-applications-overview)
- [🔧 Installation Guide](#-installation-guide)
- [🌐 API Documentation](#-api-documentation)
- [📱 Mobile App (APK)](#-mobile-app-apk)
- [👥 User Roles & Access](#-user-roles--access)
- [🗄️ Database Schema](#️-database-schema)
- [🔒 Security Features](#-security-features)
- [📊 Project Status](#-project-status)
- [🤝 Contributing Guidelines](#-contributing-guidelines)
- [📞 Support & Contact](#-support--contact)

---

## 🏗️ Project Architecture

```
APNA DECORATION/
├── User/                    # Customer Mobile App (Port 3000)
│   ├── frontend/           # React customer application
│   └── backend/            # Node.js customer API (Port 5002)
├── Vendor/                 # Vendor Management System
│   ├── frontend/           # React vendor dashboard
│   └── backend/            # Node.js vendor API
├── Admin/                  # Admin Management System
│   ├── frontend/           # React admin dashboard (Port 3001)
│   └── backend/            # Node.js admin API (Port 5000)
├── User/                   # Main User Application (Port 3000)
│   ├── src/                # React source code
│   ├── android/            # Android APK project
│   └── backend/            # Node.js API (Port 5002)
└── README.md              # This file
```

### **System Flow**
```
Customer App (3000) ←→ User Backend (5002) ←→ MongoDB
Vendor Dashboard (?) ←→ Vendor Backend (?)   ←→ MongoDB  
Admin Dashboard (3001) ←→ Admin Backend (5000) ←→ MongoDB
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v14+)
- MongoDB (running locally)
- Android Studio (for APK development)
- Git

### **One-Command Setup**
```bash
# Clone and setup all applications
git clone <repository-url>
cd APNA DECORATION
npm run setup:all
```

### **Individual Setup**
```bash
# Setup User Application
cd User
npm install
npm start

# Setup Admin Application  
cd ../Admin
npm install
npm start

# Setup Vendor Application
cd ../Vendor
npm install
npm start
```

---

## 📱 Applications Overview

### **1. User Application (Customer)**
- **Port**: 3000
- **Technology**: React + Node.js
- **Features**: Shopping, Cart, Orders, Profile
- **Mobile**: APK available for Android

### **2. Admin Application**
- **Port**: 3001
- **Technology**: React + Node.js  
- **Features**: Product Management, Orders, Analytics, User Management

### **3. Vendor Application**
- **Port**: TBD (separate from user app)
- **Technology**: React + Node.js
- **Features**: Product Management, Order Fulfillment, Sales Analytics

---

## 🔧 Installation Guide

### **1. Database Setup**
```bash
# Start MongoDB
mongod

# Create database
use apna_decoration

# Insert sample data (optional)
db.users.insertMany([...])
db.products.insertMany([...])
```

### **2. Backend Setup**

#### **User Backend (Port 5002)**
```bash
cd User/backend
npm install
cp .env.example .env
# Edit .env with your configurations
npm run dev
```

#### **Admin Backend (Port 5000)**
```bash
cd Admin/backend  
npm install
cp .env.example .env
# Edit .env with your configurations
npm run dev
```

#### **Vendor Backend**
```bash
cd Vendor/backend
npm install
cp .env.example .env
npm run dev
```

### **3. Frontend Setup**

#### **User Frontend (Port 3000)**
```bash
cd User
npm install
npm start
```

#### **Admin Frontend (Port 3001)**
```bash
cd Admin/frontend
npm install
npm start
```

#### **Vendor Frontend**
```bash
cd Vendor/frontend
npm install
npm start
```

---

## 🌐 API Documentation

### **User API (Port 5002)**
```
GET    /api/products          # Get all products
GET    /api/products/:id      # Get product details
POST   /api/auth/login        # User login
POST   /api/auth/register     # User registration
GET    /api/cart             # Get user cart
POST   /api/cart/add         # Add to cart
GET    /api/orders           # Get user orders
```

### **Admin API (Port 5000)**
```
GET    /api/admin/products    # Admin product management
POST   /api/admin/products    # Create product
PUT    /api/admin/products/:id # Update product
GET    /api/admin/orders      # Order management
GET    /api/admin/users       # User management
GET    /api/admin/analytics   # Dashboard analytics
```

### **Vendor API**
```
GET    /api/vendor/products   # Vendor products
POST   /api/vendor/products   # Add product
PUT    /api/vendor/products/:id # Update product
GET    /api/vendor/orders     # Vendor orders
GET    /api/vendor/analytics  # Vendor analytics
```

---

## 📱 Mobile App (APK)

### **Building the APK**
```bash
cd User
npm run build
npx cap sync android

# Using Android Studio
open android/
# Build → Build APK(s)

# Or Command Line
cd android
./gradlew assembleDebug
```

### **APK Configuration**
- **App Name**: APNA DECORATION
- **Package ID**: com.apnadecoration.app
- **Server URL**: http://localhost:3000 (development)
- **Production URL**: https://your-domain.com (production)

### **APK Features**
- ✅ User login/registration
- ✅ Product browsing
- ✅ Shopping cart
- ✅ Order placement
- ✅ Order tracking
- ✅ Profile management

---

## 👥 User Roles & Access

### **🛍️ Customer (User)**
- **Login**: `/login`
- **Dashboard**: `/profile`
- **Features**: 
  - Browse products
  - Add to cart
  - Place orders
  - Track orders
  - Manage profile

### **👨‍💼 Administrator**
- **Login**: `/login` (admin credentials)
- **Dashboard**: `/admin/dashboard`
- **Features**:
  - Manage all products
  - Manage all orders
  - User management
  - Analytics & reports
  - System settings

### **🏪 Vendor**
- **Login**: `/vendor/login` (separate app)
- **Dashboard**: `/vendor/dashboard`
- **Features**:
  - Manage own products
  - Process own orders
  - View sales analytics
  - Manage vendor profile

---

## 🗄️ Database Schema

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed
  role: String, // 'customer', 'admin', 'vendor'
  phone: String,
  address: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Products Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  thumbnail: String,
  stock: Number,
  sku: String,
  vendor: ObjectId, // reference to vendor
  status: String, // 'active', 'inactive', 'pending'
  createdAt: Date,
  updatedAt: Date
}
```

### **Orders Collection**
```javascript
{
  _id: ObjectId,
  orderNumber: String,
  customer: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String, // 'pending', 'confirmed', 'shipped', 'delivered'
  shippingAddress: Object,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

### **Authentication & Authorization**
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ API rate limiting

### **Data Protection**
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ File upload security

### **API Security**
- ✅ Request validation
- ✅ Error handling
- ✅ Logging and monitoring
- ✅ Environment variable protection

---

## 📊 Project Status

### **✅ Completed Features**
- [x] User authentication system
- [x] Product management
- [x] Shopping cart functionality
- [x] Order processing
- [x] Admin dashboard
- [x] Vendor dashboard
- [x] Mobile APK generation
- [x] Database integration
- [x] Security implementation

### **🚧 In Progress**
- [ ] Payment gateway integration
- [ ] Email notification system
- [ ] Advanced search and filtering
- [ ] Product review system
- [ ] Multi-language support

### **📋 Planned Features**
- [ ] Real-time chat support
- [ ] Wishlist functionality
- [ ] Discount coupon system
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Mobile app for iOS

---

## 🤝 Contributing Guidelines

### **Development Workflow**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Standards**
- Use ESLint for code formatting
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

### **Branch Structure**
- `main` - Production code
- `develop` - Development code
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes

---

## 📞 Support & Contact

### **Project Information**
- **Version**: 1.0.0
- **Last Updated**: January 2026
- **License**: MIT
- **Status**: Production Ready

### **Technical Support**
- **Documentation**: This README file
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

### **Contact Details**
- **Email**: support@apnadecoration.com
- **Website**: https://apnadecoration.com
- **Phone**: +91 XXXXX XXXXX

### **Deployment Information**
- **Production URL**: https://apnadecoration.com
- **API Base URL**: https://api.apnadecoration.com
- **Admin Panel**: https://admin.apnadecoration.com
- **Vendor Portal**: https://vendor.apnadecoration.com

---

## 🎯 Quick Reference

### **Port Configuration**
| Service | Port | Description |
|---------|------|-------------|
| User Frontend | 3000 | Customer React App |
| Admin Frontend | 3001 | Admin React Dashboard |
| User Backend | 5002 | Customer API Server |
| Admin Backend | 5000 | Admin API Server |
| MongoDB | 27017 | Database Server |

### **Default Credentials**
- **Admin**: admin@apnadecoration.com / admin123
- **Customer**: user@example.com / password
- **Vendor**: vendor@example.com / vendor123

### **Useful Commands**
```bash
# Start all services
npm run start:all

# Build for production
npm run build:prod

# Run tests
npm run test

# Generate APK
npm run build:apk
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🏪 APNA DECORATION - Transforming Home Decoration Shopping Experience**

*Built with ❤️ using React, Node.js, and MongoDB*
#   A p n a D e c o r a t i o n  
 