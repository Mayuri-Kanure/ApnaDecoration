# 🏪 APNA Decoration - Complete E-Commerce Platform

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A **complete multi-vendor e-commerce platform** for home decoration and furniture products with enterprise-grade features and modern architecture.

## 🌟 Live Demo

**🚀 Coming Soon!** Platform is under development with advanced features.

- **Website**: https://apnadecoration.com (Launching Soon)
- **Admin Panel**: https://admin.apnadecoration.com
- **Vendor Portal**: https://vendor.apnadecoration.com

---

## 📱 Platform Overview

APNA Decoration is a **comprehensive e-commerce ecosystem** that connects customers, vendors, administrators, and delivery partners in a seamless digital marketplace for home decoration and furniture products.

### 🎯 Target Audience
- **Homeowners** looking for decoration products
- **Furniture vendors** wanting to sell online
- **Interior designers** seeking quality products
- **Delivery partners** for logistics services

---

## 🚀 Key Features

### 🛍️ Customer Application
- **Premium Shopping Experience** - Modern UI with advanced filtering
- **Product Search & Discovery** - Smart search with categories
- **Shopping Cart & Checkout** - Secure payment integration
- **Order Tracking** - Real-time delivery updates
- **Wishlist & Reviews** - Save favorites and share experiences
- **Mobile Responsive** - Works perfectly on all devices

### 🏪 Vendor Management System
- **Product Management** - Add/edit products with variants
- **Inventory Control** - Stock tracking and alerts
- **Order Processing** - Manage orders and fulfillment
- **Sales Analytics** - Revenue and performance insights
- **Wallet System** - Automatic commission management
- **Brand Promotion** - Featured listings and visibility options

### 👨‍💼 Admin Dashboard
- **Complete Control** - Manage all platform aspects
- **User Management** - Customers, vendors, delivery partners
- **Product Approval** - Review and approve vendor products
- **Analytics & Reports** - Business intelligence dashboard
- **Flash Deals & Promotions** - Create marketing campaigns
- **System Configuration** - Platform settings and preferences

### 🚚 Delivery Management
- **Real-time Tracking** - GPS-based delivery monitoring
- **Route Optimization** - Efficient delivery planning
- **Delivery Analytics** - Performance metrics and insights
- **Mobile App** - Delivery partner mobile application

---

## 🏗️ Technical Architecture

### **Frontend Technologies**
- **React.js** - Modern component-based UI
- **Material-UI & Tailwind CSS** - Premium design system
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - API communication

### **Backend Technologies**
- **Node.js & Express.js** - RESTful API server
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT Authentication** - Secure token-based auth
- **Multer & Cloudinary** - File upload and image storage
- **Socket.io** - Real-time notifications

### **Database Design**
- **Multi-tenant Architecture** - Separate collections for each entity
- **Parent-Child Product Variants** - Advanced variant management
- **ACID Compliance** - Transactional data integrity
- **Optimized Indexing** - Performance-driven queries

---

## 📊 Platform Statistics

### **Enterprise Features Implemented**
- ✅ **16 New Vendor Features** - Complete vendor ecosystem
- ✅ **Multi-Variant Architecture** - Parent-child product system
- ✅ **Enterprise Security** - Comprehensive data protection
- ✅ **Real-time Analytics** - Business intelligence
- ✅ **Mobile Applications** - Android APK support

### **System Capabilities**
- 🚀 **Scalable Architecture** - Handles thousands of concurrent users
- 🔒 **Enterprise Security** - Bank-level data protection
- 📱 **Mobile-First Design** - Responsive across all devices
- 🌍 **Multi-Location Support** - Geographic-based features
- ⚡ **High Performance** - Optimized for speed and reliability

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 14+ 
- MongoDB 4.4+
- npm or yarn
- Git

### **Quick Start**
```bash
# Clone the repository
git clone https://github.com/Mayuri-Kanure/ApnaDecoration.git
cd ApnaDecoration

# Install dependencies for all applications
npm run setup:all

# Start development servers
npm run start:all
```

### **Individual Application Setup**
```bash
# Customer Application (Port 3000)
cd User/frontend && npm install && npm start
cd User/backend && npm install && npm run dev

# Admin Panel (Port 3001)
cd Admin/frontend && npm install && npm start
cd Admin/backend && npm install && npm run dev

# Vendor Portal (Port 3002)
cd Vendor/frontend && npm install && npm start
cd Vendor/backend && npm install && npm run dev

# Delivery App (Port 3003)
cd Delivery/frontend && npm install && npm run dev
```

### **Environment Configuration**
```bash
# Copy environment templates
cp Admin/backend/.env.example Admin/backend/.env
cp User/backend/.env.example User/backend/.env
cp Vendor/backend/.env.example Vendor/backend/.env

# Configure your database and API keys
# MONGODB_URI=mongodb://localhost:27017/apna-decoration
# JWT_SECRET=your-jwt-secret-key
# CLOUDINARY_CLOUD_NAME=your-cloudinary-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📱 Mobile Applications

### **Android Application**
- **Technology**: React Native with Capacitor
- **Features**: Full e-commerce functionality
- **Build**: `npm run build:apk`
- **Status**: Production-ready

### **Mobile Features**
- 🛍️ **Complete Shopping** - Browse, cart, checkout
- 📦 **Order Management** - Track and manage orders
- 🔔 **Push Notifications** - Real-time updates
- 📍 **Location Services** - Geographic features
- 💳 **Payment Integration** - Secure mobile payments

---

## 🔐 Security Features

### **Enterprise-Grade Security**
- 🔒 **JWT Authentication** - Secure token-based authentication
- 🛡️ **Role-Based Access Control** - Admin, Vendor, Customer, Delivery roles
- 🔐 **Input Validation** - Comprehensive data sanitization
- 🚫 **Rate Limiting** - API protection against abuse
- 🔑 **Environment Variables** - Secure configuration management
- 🔒 **CORS Protection** - Cross-origin request security

### **Data Protection**
- 🗝️ **Password Hashing** - bcrypt encryption
- 🔒 **API Key Security** - No hardcoded credentials
- 🛡️ **SQL Injection Prevention** - Parameterized queries
- 🔐 **XSS Protection** - Cross-site scripting prevention
- 🚫 **CSRF Protection** - Cross-site request forgery prevention

---

## 📈 Business Features

### **Vendor Management**
- 💰 **Commission System** - Automatic percentage-based deductions
- 📊 **Sales Analytics** - Revenue, orders, top products
- 🏪 **Store Customization** - Brand banners and promotions
- 📦 **Inventory Management** - Stock tracking and alerts
- 🎯 **Product Visibility** - Location-based product display
- 💳 **Wallet System** - Automated payment processing

### **Marketing & Promotions**
- 🎉 **Flash Deals** - Time-limited promotional campaigns
- 🏷️ **Coupon System** - Discount code management
- 🌟 **Featured Products** - Premium placement options
- 📢 **Brand Promotion** - Paid advertising features
- 📊 **Performance Analytics** - Campaign effectiveness tracking

### **Customer Experience**
- 🔍 **Advanced Search** - Smart product discovery
- ⭐ **Review System** - Customer feedback and ratings
- 🛒 **Quick Checkout** - Streamlined purchase process
- 📦 **Order Tracking** - Real-time delivery updates
- 🔔 **Notifications** - Email and push notifications
- 📱 **Mobile Experience** - Native app functionality

---

## 🎨 Screenshots & UI

### **Customer Application**
- 🏠 **Home Page** - Featured products and categories
- 🔍 **Product Browse** - Advanced filtering and search
- 📱 **Product Details** - Comprehensive product information
- 🛒 **Shopping Cart** - Easy cart management
- 📦 **Order Tracking** - Real-time delivery updates

### **Admin Dashboard**
- 📊 **Analytics Dashboard** - Business insights and metrics
- 🏪 **Product Management** - Complete product control
- 👥 **User Management** - Customer and vendor administration
- 📈 **Reports Section** - Detailed business reports
- ⚙️ **System Settings** - Platform configuration

### **Vendor Portal**
- 📦 **Product Catalog** - Vendor product management
- 📊 **Sales Dashboard** - Performance analytics
- 💰 **Earnings Overview** - Revenue and commission tracking
- 🏪 **Store Settings** - Vendor profile and customization

---

## 🔧 Development Workflow

### **Project Structure**
```
APNA DECORATION _APP/
├── User/                    # Customer Application
│   ├── frontend/           # React customer app (Port 3000)
│   └── backend/            # Node.js customer API (Port 5002)
├── Admin/                  # Admin Management System
│   ├── frontend/           # React admin dashboard (Port 3001)
│   └── backend/            # Node.js admin API (Port 5000)
├── Vendor/                 # Vendor Portal
│   ├── frontend/           # React vendor dashboard (Port 3002)
│   └── backend/            # Node.js vendor API
├── Delivery/               # Delivery Management
│   └── frontend/           # React delivery app (Port 3003)
├── shared/                 # Shared utilities and components
└── scripts/                # Build and deployment scripts
```

### **Available Scripts**
```bash
# Development
npm run start:all           # Start all applications
npm run dev:admin          # Start admin panel only
npm run dev:user           # Start customer app only
npm run dev:vendor         # Start vendor portal only

# Building
npm run build:all          # Build all applications
npm run build:apk          # Build Android APK

# Database
npm run setup:db           # Setup database indexes
npm run seed:db            # Seed sample data

# Deployment
npm run deploy:prod        # Deploy to production
npm run deploy:dev         # Deploy to development
```

---

## 🤝 Contributing

We welcome contributions! Please follow our guidelines:

### **Development Guidelines**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Code Standards**
- ✅ Use ESLint for code formatting
- ✅ Follow React best practices
- ✅ Write meaningful commit messages
- ✅ Add comments for complex logic
- ✅ Test your changes thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

### **Project Information**
- **Version**: 1.0.0
- **Last Updated**: April 2026
- **License**: MIT
- **Status**: Production Ready

### **Technical Support**
- **Documentation**: This README file
- **Issues**: [GitHub Issues](https://github.com/Mayuri-Kanure/ApnaDecoration/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mayuri-Kanure/ApnaDecoration/discussions)

### **Contact Details**
- **Email**: support@apnadecoration.com
- **Website**: https://apnadecoration.com
- **GitHub**: https://github.com/Mayuri-Kanure/ApnaDecoration

---

## 🎯 Future Roadmap

### **Q2 2026**
- 🤖 **AI Product Recommendations** - Smart suggestion engine
- 📱 **iOS Application** - Native iPhone app
- 🌍 **Multi-Language Support** - Internationalization
- 🔄 **Advanced Analytics** - Business intelligence dashboard

### **Q3 2026**
- 🎨 **AR Furniture Preview** - Augmented reality features
- 🗣️ **Voice Search** - Natural language product discovery
- 📊 **Advanced Reporting** - Custom analytics and insights
- 🌐 **Global Expansion** - Multi-country support

### **Q4 2026**
- ⚡ **Performance Optimization** - Speed and reliability improvements
- 🔧 **API V2** - Enhanced developer experience
- 📱 **Progressive Web App** - PWA features and offline support
- 🏪 **Marketplace Expansion** - New product categories

---

## 🏆 Why APNA Decoration?

### **🎯 Problem Solved**
Transforming the fragmented home decoration market into a unified digital ecosystem where vendors can reach customers nationwide and customers can discover quality products easily.

### **💡 Unique Value Proposition**
- 🏪 **Unified Marketplace** - Single platform for multiple vendors
- 📊 **Data-Driven Insights** - Analytics for business growth
- 🚀 **Mobile-First Approach** - Native app experience
- 🔒 **Enterprise Security** - Bank-level data protection
- 🌍 **Scalable Architecture** - Built for growth

### **🚀 Impact**
- **For Vendors**: Increased reach and sales opportunities
- **For Customers**: Better product discovery and experience
- **For Market**: Digital transformation of traditional industry

---

**🏪 APNA Decoration - Transforming Home Decoration Shopping Experience**

*Built with ❤️ using React, Node.js, and MongoDB*
