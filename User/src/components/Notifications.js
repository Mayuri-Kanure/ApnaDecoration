import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { X, Bell, Check, AlertCircle, Info, CheckCircle, Settings, Smartphone } from 'lucide-react';

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotification();
  
  const {
    isInitialized,
    permissionStatus,
    deviceToken,
    notifications: pushNotifications,
    unreadCount: pushUnreadCount,
    subscribeToTopic,
    sendTestNotification,
    markAsRead: markPushAsRead,
    clearNotifications
  } = usePushNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('app'); // 'app' or 'push'

  // Combine app and push notifications
  const allNotifications = [
    ...notifications.map(n => ({ ...n, source: 'app' })),
    ...pushNotifications.map(n => ({ ...n, source: 'push' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalUnreadCount = unreadCount + pushUnreadCount;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      if (notification.source === 'app') {
        markAsRead(notification.id);
      } else {
        markPushAsRead(notification.id);
      }
    }

    // Handle navigation based on notification data
    if (notification.data) {
      const { type, orderId, productId } = notification.data;
      
      if (type === 'order_update' && orderId) {
        window.location.href = `/orders/${orderId}`;
      } else if (type === 'product_update' && productId) {
        window.location.href = `/products/${productId}`;
      } else if (type === 'cart_update') {
        window.location.href = '/cart';
      }
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    pushNotifications.forEach(notification => {
      if (!notification.read) {
        markPushAsRead(notification.id);
      }
    });
  };

  const handleSubscribeToTopic = async (topic) => {
    try {
      await subscribeToTopic(topic);
      alert(`Successfully subscribed to ${topic}`);
    } catch (error) {
      alert(`Failed to subscribe to ${topic}: ${error.message}`);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await sendTestNotification();
      alert('Test notification sent successfully');
    } catch (error) {
      alert(`Failed to send test notification: ${error.message}`);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        
        {/* Combined Unread Count Badge */}
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
        
        {/* Push Notification Status Indicator */}
        {isInitialized && (
          <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
            permissionStatus === 'granted' ? 'bg-green-500' : 'bg-yellow-500'
          }`} title={`Push notifications ${permissionStatus === 'granted' ? 'enabled' : 'disabled'}`} />
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Notification Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setActiveTab('app')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'app'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  App ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('push')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'push'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Push ({pushUnreadCount})
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Push Notifications</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isInitialized 
                        ? permissionStatus === 'granted' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isInitialized 
                        ? permissionStatus === 'granted' 
                          ? 'Enabled'
                          : 'Disabled'
                        : 'Not Initialized'
                      }
                    </span>
                  </div>
                  
                  {isInitialized && (
                    <div className="space-y-2">
                      <button
                        onClick={handleSendTestNotification}
                        className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        Send Test Notification
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubscribeToTopic('orders')}
                          className="flex-1 text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                        >
                          Orders
                        </button>
                        <button
                          onClick={() => handleSubscribeToTopic('promotions')}
                          className="flex-1 text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                        >
                          Promotions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {allNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <>
                  {/* Mark all as read button */}
                  {totalUnreadCount > 0 && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                  
                  {/* Notification Items */}
                  {allNotifications
                    .filter(n => activeTab === 'app' ? n.source === 'app' : n.source === 'push')
                    .map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500">
                              {notification.source === 'push' && (
                                <Smartphone className="w-3 h-3 inline mr-1" />
                              )}
                              {new Date(notification.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.body}
                          </p>
                          {notification.data && (
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {notification.data.type?.replace('_', ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    removeNotification(notifications[0].id);
                    if (notifications.length === 1) {
                      setIsOpen(false);
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear oldest
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
