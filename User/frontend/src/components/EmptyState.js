import React from 'react';
import { ShoppingBag, Search, Heart, Package, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionText, 
  actionLink, 
  onAction,
  icon: customIcon,
  className = ''
}) => {
  const getIcon = () => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'cart':
        return <ShoppingBag size={48} className="text-gray-400" />;
      case 'search':
        return <Search size={48} className="text-gray-400" />;
      case 'wishlist':
        return <Heart size={48} className="text-gray-400" />;
      case 'orders':
        return <Package size={48} className="text-gray-400" />;
      case 'messages':
        return <MessageSquare size={48} className="text-gray-400" />;
      case 'error':
        return <AlertCircle size={48} className="text-red-400" />;
      case 'loading':
        return <RefreshCw size={48} className="text-blue-400 animate-spin" />;
      default:
        return <Package size={48} className="text-gray-400" />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'cart':
        return {
          title: 'Your cart is empty',
          description: 'Start shopping to add items to your cart',
          actionText: 'Start Shopping',
          actionLink: '/products'
        };
      case 'search':
        return {
          title: 'No products found',
          description: 'Try adjusting your search terms or browse our categories',
          actionText: 'Browse Products',
          actionLink: '/products'
        };
      case 'wishlist':
        return {
          title: 'Your wishlist is empty',
          description: 'Save items you love to your wishlist for later',
          actionText: 'Browse Products',
          actionLink: '/products'
        };
      case 'orders':
        return {
          title: 'No orders yet',
          description: 'Once you place an order, it will appear here',
          actionText: 'Start Shopping',
          actionLink: '/products'
        };
      case 'messages':
        return {
          title: 'No messages yet',
          description: 'Your conversation history will appear here',
          actionText: 'Contact Support',
          actionLink: '/contact'
        };
      case 'error':
        return {
          title: 'Something went wrong',
          description: 'We encountered an error. Please try again.',
          actionText: 'Try Again',
          onAction: () => window.location.reload()
        };
      case 'loading':
        return {
          title: 'Loading...',
          description: 'Please wait while we fetch your data',
          actionText: null,
          actionLink: null
        };
      default:
        return {
          title: 'No data available',
          description: 'There\'s nothing to show here right now',
          actionText: null,
          actionLink: null
        };
    }
  };

  const content = title || description ? { title, description, actionText, actionLink, onAction } : getDefaultContent();

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center relative overflow-hidden ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-50"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-8 transform transition-transform duration-500 hover:scale-110">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            {getIcon()}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          {content.title}
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
          {content.description}
        </p>
        
        {content.actionText && (
          <div className="flex flex-col sm:flex-row gap-4">
            {onAction ? (
              <button
                onClick={onAction}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
              >
                <span className="relative z-10">{content.actionText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-300"></div>
              </button>
            ) : actionLink ? (
              <a
                href={actionLink}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
              >
                <span className="relative z-10">{content.actionText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-opacity duration-300"></div>
              </a>
            ) : null}
            
            {/* Secondary action for better UX */}
            {type === 'search' && (
              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 rounded-2xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
              >
                Go Back
              </button>
            )}
          </div>
        )}
        
        {/* Helpful tips for specific empty states */}
        {type === 'cart' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Add items to your cart and they'll appear here for easy checkout!
            </p>
          </div>
        )}
        
        {type === 'wishlist' && (
          <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm text-purple-700">
              💡 <strong>Tip:</strong> Click the heart icon on any product to save it to your wishlist!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
