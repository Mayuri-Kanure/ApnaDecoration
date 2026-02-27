import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, IMAGE_BASE_URL } from '../config/constants';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import paymentMethodService from '../services/paymentMethodService';
import notificationService from '../services/notificationService';
import { Search, ShoppingBag, User, Heart, ChevronRight, Edit2, Package, CreditCard, MapPin, Bell, Shield, LogOut, Camera, X, Check, ArrowLeft, Trash2, Upload, Building2, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
import '../components/ProfileTabs.css';

// Card logo function
const getCardLogo = (brand) => {
  switch (brand) {
    case 'Visa':
      return '💳 Visa';
    case 'Mastercard':
      return '💳 Mastercard';
    case 'Amex':
      return '💳 Amex';
    case 'Discover':
      return '💳 Discover';
    case 'Diners Club':
      return '💳 Diners Club';
    case 'JCB':
      return '💳 JCB';
    case 'RuPay':
      return '💳 RuPay';
    default:
      return '💳 Card';
  }
};

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState(() => {
    // Split the user's name into firstName and lastName
    const nameParts = (user?.name || '').split(' ');
    console.log('👤 Initial user object:', user);
    console.log('👤 User profileImage:', user?.profileImage);
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      profileImage: user?.profileImage || ''
    };
  });

  const [addressData, setAddressData] = useState([]);
  const [orders, setOrders] = useState([]);
  const fileInputRef = useRef(null);

  // Sync userData with AuthContext user changes
  useEffect(() => {
    if (user) {
      console.log('👤 Syncing userData with AuthContext user:', user);
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  // Camera and image upload handlers
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📷 Image selected for profile update:', file.name);
      
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('profileImage', file);
        
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login to update profile image');
          return;
        }
        
        // Upload to backend which will handle Cloudinary
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/upload-profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          alert('Profile image updated successfully!');
          console.log('✅ Profile image uploaded to Cloudinary:', result.data.profileImage);
          
          // Update local state with Cloudinary URL
          setUserData(prev => ({ 
            ...prev, 
            profileImage: result.data.profileImage 
          }));
          
          // Update auth context
          const updatedProfile = {
            profileImage: result.data.profileImage
          };
          await updateProfile(updatedProfile);
          
        } else {
          console.error('❌ Profile image upload failed:', result.message);
          alert(result.message || 'Failed to update profile image');
        }
        
      } catch (error) {
        console.error('❌ Profile image upload error:', error);
        alert('Failed to update profile image. Please try again.');
      }
    }
  };

  const handleCameraClick = () => {
    console.log('📷 Camera button clicked');
    // In a real implementation, this would access the device camera
    alert('Camera feature would access your device camera to take a photo');
  };
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: false
  });
  const [notificationSettings, setNotificationSettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: true,
    passwordStrength: 'medium'
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: true,
    passwordStrength: 'medium'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Payment method handlers
  const handleUpdatePaymentMethod = async (id, paymentData) => {
    console.log('💳 Updating payment method:', { id, ...paymentData });
    try {
      const response = await paymentMethodService.updatePaymentMethod(id, paymentData);
      if (response.success) {
        const updatedMethods = paymentMethods.map(method => 
          method._id === id ? { ...method, ...paymentData } : method
        );
        setPaymentMethods(updatedMethods);
        toast.success('Payment method updated successfully!');
        console.log('✅ Payment method updated:', response.data);
      } else {
        toast.error('Failed to update payment method');
        console.error('❌ Update payment method error:', response.message);
      }
    } catch (error) {
      console.error('❌ Update payment method error:', error);
      toast.error('Failed to update payment method');
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    console.log('🗑️ Deleting payment method:', id);
    try {
      const response = await paymentMethodService.deletePaymentMethod(id);
      if (response.success) {
        const updatedMethods = paymentMethods.filter(method => method._id !== id);
        setPaymentMethods(updatedMethods);
        toast.success('Payment method deleted successfully!');
        console.log('✅ Payment method deleted:', id);
      } else {
        toast.error('Failed to delete payment method');
        console.error('❌ Delete payment method error:', response.message);
      }
    } catch (error) {
      console.error('❌ Delete payment method error:', error);
      toast.error('Failed to delete payment method');
    }
  };
  const [loading, setLoading] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'credit_card',
    provider: '',
    cardNumber: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    upiId: '',
    bankName: '',
    walletType: '',
    isDefault: false
  });

  // Helper function to render payment method based on type
  const renderPaymentMethod = (method) => {
    switch (method.type) {
      case 'credit_card':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{getCardLogo(method.brand)} {method.brand || 'Card'}</h4>
                  <p className="text-sm text-gray-600">**** **** {method.last4 || '****'}</p>
                  <p className="text-xs text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Default
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <button className="w-full p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        );

      case 'debit_card':
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{getCardLogo(method.brand)} {method.brand || 'Card'}</h4>
                  <p className="text-sm text-gray-600">**** **** {method.last4 || '****'}</p>
                  <p className="text-xs text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Default
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <button className="w-full p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        );

      case 'upi':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">UPI Payment</h4>
                  <p className="text-sm text-gray-600">{method.upiId}</p>
                  <p className="text-xs text-gray-500">Provider: {method.provider}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Default
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <button className="w-full p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        );

      case 'net_banking':
        return (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{method.bankName || 'Bank Account'}</h4>
                  <p className="text-sm text-gray-600">Net Banking</p>
                  <p className="text-xs text-gray-500">Provider: {method.provider}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Default
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <button className="w-full p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Smartphone size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{method.walletType || 'Wallet'}</h4>
                  <p className="text-sm text-gray-600">{method.provider}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Default
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <button className="w-full p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showEditAddressForm, setShowEditAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });

  // Load addresses from backend
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await addressService.getAddresses();
        console.log('🏠 Addresses API response:', response);
        console.log('🏠 Addresses response.data:', response.data);
        console.log('🏠 Addresses response.data.data:', response.data?.data);
        // Response is the addresses array directly, not wrapped in data property
        setAddressData(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Failed to load addresses:', error);
      }
    };

    loadAddresses();
  }, []);

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🚫 Cancelling order:', orderId);
      
      // Get user token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Use the correct API URL
      const API_URL = process.env.REACT_APP_API_URL || 'https://user-api.apnadecoration.com';
      const cancelUrl = `${API_URL}/api/orders/${orderId}/cancel`;
      
      console.log('🚫 Cancel order URL:', cancelUrl);

      // Call backend cancel order API
      const response = await fetch(cancelUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Customer requested cancellation'
        })
      });

      console.log('🚫 Cancel order response status:', response.status);
      console.log('🚫 Cancel order response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🚫 Cancel order error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to cancel order');
      }

      const result = await response.json();
      console.log('✅ Order cancelled successfully:', result);

      // Show success message
      alert('Order cancelled successfully. The order has been removed from your active orders.');

      // Reload orders to refresh the list
      const loadOrders = async () => {
        try {
          const orderData = await orderService.getOrders();
          console.log('📦 Profile - Orders response after cancel:', orderData);
          
          // Handle different response structures
          let ordersArray = [];
          if (orderData?.data?.orders) {
            ordersArray = orderData.data.orders;
          } else if (orderData?.orders) {
            ordersArray = orderData.orders;
          } else if (orderData?.data && Array.isArray(orderData.data)) {
            ordersArray = orderData.data;
          } else if (Array.isArray(orderData)) {
            ordersArray = orderData;
          }
          
          console.log('📦 Profile - Final orders array after cancel:', ordersArray);
          setOrders(ordersArray);
        } catch (error) {
          console.log('📦 Error reloading orders after cancel:', error.message);
        }
      };

      await loadOrders();

    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('📦 Profile - Starting to load orders...');
        const token = localStorage.getItem('token');
        console.log('📦 Profile - Token exists:', !!token);
        
        const orderData = await orderService.getOrders();
        console.log('📦 Profile - Orders response:', orderData);
        console.log('📦 Profile - Orders data:', orderData?.data);
        console.log('📦 Profile - Orders array:', orderData?.data?.orders || orderData?.orders || orderData?.data);
        
        // Handle different response structures
        let ordersArray = [];
        if (orderData?.data?.orders) {
          ordersArray = orderData.data.orders;
        } else if (orderData?.orders) {
          ordersArray = orderData.orders;
        } else if (orderData?.data && Array.isArray(orderData.data)) {
          ordersArray = orderData.data;
        } else if (Array.isArray(orderData)) {
          ordersArray = orderData;
        }
        
        console.log('📦 Profile - Final orders array:', ordersArray);
        console.log('📦 Profile - Orders array length:', ordersArray.length);
        setOrders(ordersArray);
      } catch (error) {
        console.log('📦 Profile - Orders endpoint not available yet, using empty array:', error.message);
        console.log('📦 Profile - Full error:', error);
        setOrders([]); // Set empty array instead of failing
      }
    };

    loadOrders();
  }, []);

  // Load payment methods from backend
  const loadPaymentMethods = useCallback(async () => {
    try {
      const methodsData = await paymentMethodService.getPaymentMethods();
      console.log('💳 Raw API response:', methodsData);
      console.log('💳 Setting payment methods state:', methodsData);
      setPaymentMethods(methodsData || []); // API service already extracts data
    } catch (error) {
      console.error('💳 Payment methods fetch error:', error);
      // Don't set empty array on error, let the existing state remain
      // setPaymentMethods([]); // Set empty array instead of failing
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Refresh payment methods when they change
  useEffect(() => {
    console.log('💳 Payment methods state changed:', paymentMethods);
  }, [paymentMethods]);

  
  // Load notifications from backend
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        console.log('🔔 Fetching notifications...');
        const notificationsData = await notificationService.getNotifications();
        console.log('🔔 Raw notifications response:', notificationsData);
        console.log('🔔 Setting notifications state:', notificationsData);
        setNotifications(notificationsData || []); // API interceptor already extracts data
      } catch (error) {
        console.error('🔔 Notifications fetch error:', error);
        console.log('🔔 Notifications endpoint not available yet, using empty array');
        setNotifications([]); // Set empty array instead of failing
      }
    };

    loadNotifications();
  }, []);

  // Load notification settings from backend
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        console.log('🔔 Loading notification settings...');
        const settingsData = await notificationService.getNotificationSettings();
        console.log('🔔 Notification settings loaded:', settingsData);
        setNotificationSettings(settingsData || {
          email: true,
          sms: false,
          push: false
        });
      } catch (error) {
        console.error('🔔 Error loading notification settings:', error);
        // Keep default settings on error
      }
    };

    loadNotificationSettings();
  }, []);

  // Debug notifications state changes
  useEffect(() => {
    console.log('🔔 Notifications state changed:', notifications);
    console.log('🔔 Notifications length:', notifications.length);
  }, [notifications]);

  // Notification settings handlers
  const handleNotificationSettingChange = async (setting, value) => {
    try {
      console.log(`🔔 Updating notification setting: ${setting} = ${value}`);
      
      // Update local state immediately for responsive UI
      setNotificationSettings(prev => ({...prev, [setting]: value}));
      
      // Save to backend
      const updatedSettings = {...notificationSettings, [setting]: value};
      const result = await notificationService.updateNotificationSettings(updatedSettings);
      console.log('🔔 Notification settings saved:', result);
      
      // Show success message
      alert('Notification preferences updated successfully!');
    } catch (error) {
      console.error('🔔 Error updating notification settings:', error);
      alert('Failed to update notification preferences');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
      }

      // Call backend API to change password
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleTwoFactor = async () => {
    try {
      const newStatus = !securitySettings.twoFactorEnabled;
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: newStatus }));
      
      // Call backend API to toggle 2FA
      const response = await fetch(`${API_BASE_URL}/api/auth/toggle-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ enabled: newStatus })
      });

      if (response.ok) {
        alert(newStatus ? 'Two-factor authentication enabled!' : 'Two-factor authentication disabled!');
      } else {
        // Revert on error
        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !newStatus }));
        alert('Failed to update two-factor authentication');
      }
    } catch (error) {
      console.error('Toggle 2FA error:', error);
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !securitySettings.twoFactorEnabled }));
      alert('Failed to update two-factor authentication');
    }
  };

  // Payment method operations
  const handlePaymentMethodInputChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentMethod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPaymentMethod = async () => {
    setLoading(true);
    try {
      const result = await paymentMethodService.createPaymentMethod(newPaymentMethod);
      if (result.success || result._id) {
        const updatedMethods = await paymentMethodService.getPaymentMethods();
        setPaymentMethods(updatedMethods);
        setShowAddPaymentForm(false);
        setNewPaymentMethod({
          type: 'credit',
          provider: '',
          cardNumber: '',
          holderName: '',
          expiryMonth: '',
          expiryYear: '',
          upiId: '',
          bankName: '',
          walletType: '',
          isDefault: false
        });
        alert('Payment method added successfully!');
      }
    } catch (error) {
      console.error('Add payment method error:', error);
      alert('Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Address operations
  const handleAddAddress = async () => {
    setLoading(true);
    try {
      const result = await addressService.createAddress(newAddress);
      if (result.success || result._id) {
        const updatedAddresses = await addressService.getAddresses();
        setAddressData(Array.isArray(updatedAddresses) ? updatedAddresses : []);
        setShowAddAddressForm(false);
        setNewAddress({
          type: 'home',
          name: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          isDefault: false
        });
        alert('Address added successfully!');
      }
    } catch (error) {
      console.error('Add address error:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditAddressInputChange = (e) => {
    const { name, value } = e.target;
    setEditingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openEditForm = (address) => {
    setEditingAddress(address);
    setShowEditAddressForm(true);
  };

  const handleUpdateAddress = async () => {
    setLoading(true);
    try {
      const result = await addressService.updateAddress(editingAddress._id, editingAddress);
      if (result.success || result._id) {
        const updatedAddresses = await addressService.getAddresses();
        setAddressData(updatedAddresses);
        setShowEditAddressForm(false);
        setEditingAddress(null);
        alert('Address updated successfully!');
      }
    } catch (error) {
      console.error('Update address error:', error);
      alert('Failed to update address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setLoading(true);
      try {
        const result = await addressService.deleteAddress(id);
        if (result.success) {
          const updatedAddresses = addressData.filter(addr => addr._id !== id);
          setAddressData(updatedAddresses);
        }
      } catch (error) {
        console.error('Delete address error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    setLoading(true);
    try {
      const result = await addressService.setDefaultAddress(id);
      if (result.success || result._id) {
        const updatedAddresses = addressData.map(addr => ({
          ...addr,
          isDefault: addr._id === id
        }));
        setAddressData(updatedAddresses);
      }
    } catch (error) {
      console.error('Set default address error:', error);
    } finally {
      setLoading(false);
    }
  };

  
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get form data
      const formData = new FormData(e.target);
      const updatedData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender')
      };

      // Use AuthContext updateProfile function
      const result = await updateProfile(updatedData);
      
      if (result.success) {
        // Update local state
        setUserData(prev => ({ ...prev, ...updatedData }));
        
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-50'
    },
    { 
      id: 'addresses', 
      label: 'Addresses', 
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-50'
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-50'
    },
    { 
      id: 'payment', 
      label: 'Payment Methods', 
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      hoverColor: 'hover:bg-orange-50'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      hoverColor: 'hover:bg-red-50'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      hoverColor: 'hover:bg-indigo-50'
    },
    { 
      id: 'logout', 
      label: 'Logout', 
      icon: LogOut,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'hover:bg-red-50 hover:text-red-600'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Edit2 size={16} />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="relative group">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {userData.profileImage ? (
              <img 
                src={userData.profileImage.startsWith('data:') ? userData.profileImage : userData.profileImage.startsWith('http') ? userData.profileImage : `${IMAGE_BASE_URL}${userData.profileImage}`}
                alt={userData.firstName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('❌ Profile image failed:', userData.profileImage);
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
                onLoad={() => {
                  console.log('✅ Profile image loaded:', userData.profileImage);
                }}
              />
            ) : null}
            <div className={`w-full h-full ${userData.profileImage ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
              <User size={48} className="text-gray-400" />
            </div>
          </div>
          
          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <div className="text-center text-white">
              <Camera size={24} className="mx-auto mb-1" />
              <span className="text-xs font-medium">Change Photo</span>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{userData.firstName} {userData.lastName}</h3>
          <p className="text-gray-600 mb-2">{userData.email}</p>
          <p className="text-sm text-gray-500 mb-4">Member since January 2024</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Upload size={16} />
              Upload New Photo
            </button>
            <button
              onClick={handleCameraClick}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <Camera size={16} />
              Take Photo
            </button>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={userData.dateOfBirth}
                onChange={(e) => setUserData({...userData, dateOfBirth: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={userData.gender}
                onChange={(e) => setUserData({...userData, gender: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-gray-900"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <p className="text-gray-900">{userData.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <p className="text-gray-900">{userData.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900">{userData.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <p className="text-gray-900">{userData.dateOfBirth}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <p className="text-gray-900 capitalize">{userData.gender}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your shipping addresses for delivery</p>
        </div>
        <button 
          onClick={() => setShowAddAddressForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <MapPin size={20} />
          Add New Address
        </button>
      </div>

      {addressData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4 " />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-gray-600 mb-4">Add your first shipping address to get started</p>
          <button 
            onClick={() => setShowAddAddressForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addressData.map(address => (
            <div key={address._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group">
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg z-10">
                  Default
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    address.type === 'home' ? 'bg-blue-100 text-blue-600' :
                    address.type === 'work' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {address.type === 'home' ? <MapPin size={16} /> :
                     address.type === 'work' ? <Package size={16} /> :
                     <MapPin size={16} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize text-lg">
                      {address.type === 'home' ? 'Home Address' :
                       address.type === 'work' ? 'Work Address' :
                       'Other Address'}
                    </h3>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        Primary Address
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => openEditForm(address)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit address"
                  >
                    <Edit2 size={16}  />
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(address._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete address"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{address.street}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">
                    <p>{address.city}, {address.state} {address.pincode}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">
                    <p>{address.country}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Added on {new Date(address.createdAt).toLocaleDateString()}
                  </span>
                  {!address.isDefault && (
                    <button 
                      onClick={() => handleSetDefaultAddress(address._id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Address Form Modal
  const renderAddressForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Address</h2>
          <button
            onClick={() => setShowAddAddressForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAddAddress(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
            <select
              name="type"
              value={newAddress.type}
              onChange={handleAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={newAddress.name}
              onChange={handleAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={newAddress.phone}
              onChange={handleAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="addressLine1"
              value={newAddress.addressLine1}
              onChange={handleAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter street address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={newAddress.addressLine2}
              onChange={handleAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleAddressInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleAddressInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={newAddress.pincode}
              onChange={handleAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter 6-digit pincode"
              pattern="[0-9]{6}"
              maxLength="6"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={newAddress.isDefault}
              onChange={(e) => handleAddressInputChange({ target: { name: 'isDefault', value: e.target.checked } })}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Set as default address</label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddAddressForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Edit Address Form Modal
  const renderEditAddressForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Address</h2>
          <button
            onClick={() => setShowEditAddressForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateAddress(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
            <select
              name="type"
              value={editingAddress?.type || 'home'}
              onChange={handleEditAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              name="street"
              value={editingAddress?.street || ''}
              onChange={handleEditAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter street address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={editingAddress?.city || ''}
                onChange={handleEditAddressInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={editingAddress?.state || ''}
                onChange={handleEditAddressInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={editingAddress?.pincode || ''}
              onChange={handleEditAddressInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter 6-digit pincode"
              pattern="[0-9]{6}"
              maxLength="6"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={editingAddress?.isDefault || false}
              onChange={(e) => handleEditAddressInputChange({ target: { name: 'isDefault', value: e.target.checked } })}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Set as default address</label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Address'}
            </button>
            <button
              type="button"
              onClick={() => setShowEditAddressForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Track and manage your orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package size={48} className="mx-auto text-gray-400 mb-4 " />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-4">Your order history will appear here once you make purchases</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            console.log('📦 Rendering order:', order);
            console.log('📦 Order structure:', {
              _id: order._id,
              orderNumber: order.orderNumber,
              items: order.items,
              itemsLength: order.items?.length,
              totalAmount: order.totalAmount,
              createdAt: order.createdAt
            });
            
            return (
              <div key={order._id || index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Product Images */}
                    <div className="flex-shrink-0">
                      {order.items && order.items.length > 0 ? (
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, itemIndex) => {
                            // Enhanced debugging for item structure
                            console.log('📦 Order item structure:', {
                              itemIndex,
                              item: item,
                              hasProduct: !!item.product,
                              productKeys: item.product ? Object.keys(item.product) : [],
                              itemKeys: Object.keys(item)
                            });
                            
                            // Simplified image handling with more fallbacks
                            let imageUrl = null;
                            let productName = 'Product';
                            
                            // Try to get image from various possible locations
                            if (item.product?.thumbnail) {
                              imageUrl = item.product.thumbnail;
                              productName = item.product.name || item.product.product_name_en || item.product.productName || 'Product';
                            } else if (item.product?.images?.[0]) {
                              imageUrl = item.product.images[0];
                              productName = item.product.name || item.product.product_name_en || item.product.productName || 'Product';
                            } else if (item.thumbnail) {
                              imageUrl = item.thumbnail;
                              productName = item.name || item.product_name_en || item.productName || 'Product';
                            } else if (item.image) {
                              imageUrl = item.image;
                              productName = item.name || item.product_name_en || item.productName || 'Product';
                            } else if (item.images?.[0]) {
                              imageUrl = item.images[0];
                              productName = item.name || item.product_name_en || item.productName || 'Product';
                            }
                            
                            console.log('🖼️ Final item data:', {
                              itemIndex,
                              imageUrl,
                              productName
                            });
                            
                            return (
                              <div key={itemIndex} className="w-16 h-16 rounded-lg border-2 border-white overflow-hidden bg-gray-100">
                                {imageUrl ? (
                                  <img 
                                    src={
                                      imageUrl.startsWith('http') 
                                        ? imageUrl 
                                        : imageUrl.startsWith('data:') 
                                          ? imageUrl 
                                          : imageUrl
                                    } 
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('❌ Order image failed:', imageUrl);
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="w-full h-full hidden items-center justify-center">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              </div>
                            );
                          })}
                          {order.items.length > 3 && (
                            <div className="w-16 h-16 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Order Information */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Order #{order.orderNumber || order._id?.slice(-8) || `ORD-${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'No date'} • {
                          order.type === 'service' 
                            ? 'Service Order' 
                            : `${order.items?.length || 0} items`
                        }
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Total: ₹{((order.pricing?.total) || (order.totalAmount) || (order.total) || (order.amount) || 0).toFixed(2)}
                      </p>
                      
                      {/* Product Names */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            {order.items.slice(0, 2).map((item, idx) => {
                              let productName = 'Product';
                              
                              if (item.product?.name) {
                                productName = item.product.name || item.product.product_name_en || item.product.productName || 'Product';
                              } else if (item.name) {
                                productName = item.name || item.product_name_en || item.productName || 'Product';
                              } else if (item.product_name_en) {
                                productName = item.product_name_en;
                              }
                              
                              return (
                                <span key={idx}>
                                  {productName}
                                  {idx < Math.min(1, order.items.length - 1) && ', '}
                                </span>
                              );
                            })}
                            {order.items.length > 2 && (
                              <span> and {order.items.length - 2} more</span>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {order.shippingAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="text-right ml-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </span>
                    
                    <div className="mt-2 space-y-1">
                      <button className="block w-full text-xs text-blue-600 hover:text-blue-800 transition-colors">
                        View Details
                      </button>
                      {order.status !== 'delivered' && (
                        <button className="block w-full text-xs text-gray-600 hover:text-gray-800 transition-colors">
                          Track Order
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          className="block w-full text-xs text-red-600 hover:text-red-800 transition-colors font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

 const renderPaymentMethods = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your payment options for quick checkout
        </p>
      </div>

      <button
        onClick={() => setShowAddPaymentForm(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
      >
        <CreditCard size={20} />
        Add Payment Method
      </button>
    </div>

    {paymentMethods && paymentMethods.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method) => (
          <div
            key={method._id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group"
          >
            {/* Default badge */}
            {method.isDefault && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                Default
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mb-3 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => console.log("Edit:", method._id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 size={16} />
              </button>

              <button
                onClick={() => console.log("Delete:", method._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              {(method.type === "credit_card" ||
                method.type === "debit_card") && (
                <>
                  <p className="font-medium text-gray-900">
                    {method.brand || "Card"} ending in{" "}
                    {method.last4 || "****"}
                  </p>

                  {method.expiryMonth && method.expiryYear && (
                    <p className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  )}
                </>
              )}

              {method.type === "upi" && (
                <>
                  <p className="font-medium text-gray-900">
                    UPI ID: {method.upiId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Provider: {method.provider}
                  </p>
                </>
              )}

              {method.type === "wallet" && (
                <>
                  <p className="font-medium text-gray-900">
                    {method.walletType}
                  </p>
                  <p className="text-sm text-gray-600">Wallet</p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 mt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Added on{" "}
                {new Date(method.createdAt).toLocaleDateString()}
              </span>

              {!method.isDefault && (
                <button
                  onClick={() =>
                    console.log("Set default:", method._id)
                  }
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No payment methods yet
        </h3>
        <p className="text-gray-600 mb-4">
          Add your first payment method for faster checkout
        </p>
        <button
          onClick={() => setShowAddPaymentForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Your First Payment Method
        </button>
      </div>
    )}
  </div>
);


  const renderAddPaymentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Payment Method</h2>
          <button
            onClick={() => setShowAddPaymentForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAddPaymentMethod(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select
              name="type"
              value={newPaymentMethod.type}
              onChange={handlePaymentMethodInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI Payment</option>
              <option value="net_banking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          {(newPaymentMethod.type === 'credit_card' || newPaymentMethod.type === 'debit_card') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={newPaymentMethod.cardNumber}
                  onChange={handlePaymentMethodInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  name="holderName"
                  value={newPaymentMethod.holderName}
                  onChange={handlePaymentMethodInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                  <input
                    type="text"
                    name="expiryMonth"
                    value={newPaymentMethod.expiryMonth}
                    onChange={handlePaymentMethodInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="12"
                    maxLength="2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                  <input
                    type="text"
                    name="expiryYear"
                    value={newPaymentMethod.expiryYear}
                    onChange={handlePaymentMethodInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="2025"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {newPaymentMethod.type === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={newPaymentMethod.upiId}
                onChange={handlePaymentMethodInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="yourname@upi"
                required
              />
            </div>
          )}

          {newPaymentMethod.type === 'net_banking' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={newPaymentMethod.bankName}
                onChange={handlePaymentMethodInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="State Bank of India"
                required
              />
            </div>
          )}

          {newPaymentMethod.type === 'wallet' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Type</label>
              <input
                type="text"
                name="walletType"
                value={newPaymentMethod.walletType}
                onChange={handlePaymentMethodInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Paytm, PhonePe, Amazon Pay"
                required
              />
            </div>
          )}

          {newPaymentMethod.type === 'credit_card' || newPaymentMethod.type === 'debit_card' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <input
                type="text"
                name="provider"
                value={newPaymentMethod.provider}
                onChange={handlePaymentMethodInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Visa, Mastercard, GPay, etc."
                required
              />
            </div>
          ) : null}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={newPaymentMethod.isDefault}
              onChange={(e) => handlePaymentMethodInputChange({ target: { name: 'isDefault', value: e.target.checked } })}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Set as default payment method</label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Payment Method'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddPaymentForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your notifications and preferences</p>
        </div>
        <button 
          onClick={async () => {
            try {
              console.log('🔔 Marking all notifications as read...');
              const result = await notificationService.markAllAsRead();
              console.log('🔔 Mark all as read result:', result);
              // Reload notifications after marking all as read
              const notificationData = await notificationService.getNotifications();
              console.log('🔔 Reloaded notifications after mark all read:', notificationData);
              setNotifications(notificationData || []);
            } catch (error) {
              console.error('🔔 Mark all as read error:', error);
            }
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-4 mb-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Bell size={48} className="mx-auto text-gray-400 mb-4 " />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">Your notifications will appear here</p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                  !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'order_update' ? 'bg-blue-100 text-blue-600' :
                      notification.type === 'product_approved' ? 'bg-green-100 text-green-600' :
                      notification.type === 'product_denied' ? 'bg-red-100 text-red-600' :
                      notification.type === 'system' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {notification.type === 'order_update' ? <Package size={16} /> :
                       notification.type === 'product_approved' ? <Check size={16} /> :
                       notification.type === 'product_denied' ? <X size={16} /> :
                       notification.type === 'system' ? <Bell size={16} /> :
                       <Bell size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      {notification.actionUrl && (
                        <button 
                          onClick={async () => {
                            try {
                              // Mark as read first
                              await notificationService.markAsRead(notification._id);
                              // Then navigate or handle action
                              console.log('Navigate to:', notification.actionUrl);
                              // Reload notifications to update read status
                              const notificationData = await notificationService.getNotifications();
                              setNotifications(notificationData || []);
                            } catch (error) {
                              console.error('Handle notification action error:', error);
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {notification.actionText || 'View Details'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                    <button 
                      onClick={async () => {
                        try {
                          await notificationService.deleteNotification(notification._id);
                          // Reload notifications after deletion
                          const notificationData = await notificationService.getNotifications();
                          setNotifications(notificationData || []);
                        } catch (error) {
                          console.error('Delete notification error:', error);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive order updates and promotions</p>
            </div>
            <button 
              onClick={() => handleNotificationSettingChange('email', !notificationSettings.email)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationSettings.email ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">SMS Alerts</p>
              <p className="text-sm text-gray-600">Get order status via SMS</p>
            </div>
            <button 
              onClick={() => handleNotificationSettingChange('sms', !notificationSettings.sms)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationSettings.sms ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                notificationSettings.sms ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">Browser notifications for offers</p>
            </div>
            <button 
              onClick={() => handleNotificationSettingChange('push', !notificationSettings.push)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                notificationSettings.push ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                notificationSettings.push ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Profile input change handler
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your account security and privacy</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Change Password Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div >
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleProfileInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Enter your first name"
                required
                autoComplete="given-name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Enter your new password"
                minLength={8}
                autoComplete="new-password"
              />
              <div className="mt-2 text-xs text-gray-500">
                Password must be at least 8 characters long
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Confirm your new password"
                required
                minLength={8}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                securitySettings.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={toggleTwoFactor}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                securitySettings.twoFactorEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {securitySettings.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
            </button>
          </div>
          
          {securitySettings.twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Check size={16} />
                <span className="text-sm font-medium">Two-factor authentication is currently enabled</span>
              </div>
              <p className="text-xs text-green-600 mt-1">You'll receive a verification code when signing in from new devices</p>
            </div>
          )}
        </div>

        {/* Security Preferences */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Login Alerts</p>
                <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
              </div>
              <button 
                onClick={() => handleProfileInputChange({ target: { name: 'loginAlerts', value: !securitySettings.loginAlerts } })}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                  securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
              </div>
              <button 
                onClick={() => handleProfileInputChange({ target: { name: 'sessionTimeout', value: !securitySettings.sessionTimeout } })}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                  securitySettings.sessionTimeout ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  securitySettings.sessionTimeout ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Login Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <div className="text-xs font-bold">C</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Chrome on Windows</p>
                  <p className="text-sm text-gray-600">Current session</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Today</p>
                <p className="text-xs text-gray-600">10:30 AM</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <div className="text-xs font-bold">M</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mobile App</p>
                  <p className="text-sm text-gray-600">Mumbai, India</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Yesterday</p>
                <p className="text-xs text-gray-600">8:15 PM</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            View All Login Activity
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Back to Home Button - Visible on all screens */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              >
                <ArrowLeft 
                  size={20} 
                  className="transition-transform duration-200 group-hover:-translate-x-1" 
                />
                <span className="font-medium">Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Tab Navigation - Always visible on small screens */}
      <div className="block lg:hidden bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <h2 className="text-xl font-semibold">My Profile</h2>
        </div>
        <div className="mobile-tab-container flex overflow-x-auto px-4 pb-4 space-x-3 scrollbar-hide">
          {tabs.filter(tab => tab.id !== 'logout').map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mobile-tab flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 text-sm font-medium min-w-fit flex-shrink-0 ${
                  activeTab === tab.id
                    ? `${tab.bgColor} ${tab.color} shadow-md transform scale-105` 
                    : `text-gray-600 ${tab.hoverColor} hover:shadow-sm hover:transform hover:scale-105`
                }`}
              >
                <div className={`tab-icon-container p-2.5 rounded-lg ${activeTab === tab.id ? 'bg-white shadow-sm' : 'bg-gray-100'} transition-colors duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]`}>
                  <Icon size={22} className={`tab-icon flex-shrink-0 transition-colors duration-200 ${
                    activeTab === tab.id ? tab.color : 'text-gray-600'
                  }`} />
                </div>
                <span className="font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Mobile Logout Button */}
        <div className="px-4 pb-3 border-t">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <aside className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">My Profile</h2>
            
            <nav className="desktop-sidebar space-y-2 overflow-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'logout') {
                        handleLogout();
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`desktop-tab w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 overflow-visible ${
                      activeTab === tab.id
                        ? `${tab.bgColor} ${tab.color} shadow-md transform scale-105` 
                        : `text-gray-600 ${tab.hoverColor} hover:shadow-sm hover:transform hover:scale-105`
                    }`}
                  >
                    <div className={`tab-icon-container p-3.5 rounded-lg ${activeTab === tab.id ? 'bg-white shadow-sm' : 'bg-gray-100'} transition-all duration-200 flex items-center justify-center min-w-[52px] min-h-[52px] overflow-visible`}>
                      <Icon size={26} className={`tab-icon flex-shrink-0 transition-colors duration-200 overflow-visible ${
                        activeTab === tab.id ? tab.color : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-base">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <div className={`w-2 h-8 rounded-full ${tab.color} bg-current opacity-20`}></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content - Full width on mobile, flex-1 on desktop */}
        <main className="w-full lg:flex-1 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'payment' && (
        <>
          {renderPaymentMethods()}
          {showAddPaymentForm && renderAddPaymentForm()}
        </>
      )}
            {activeTab === 'addresses' && (
        <>
          {renderAddresses()}
          {showAddAddressForm && renderAddressForm()}
          {showEditAddressForm && renderEditAddressForm()}
        </>
      )}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'security' && renderSecurity()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
