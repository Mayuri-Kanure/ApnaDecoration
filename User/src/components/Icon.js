import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  variant = 'default',
  animated = false,
  color = 'default',
  ...props 
}) => {
  // Get the Lucide icon component by name
  const IconComponent = LucideIcons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  // Define variant styles
  const variantStyles = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    white: 'text-white',
    dark: 'text-gray-900',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    muted: 'text-gray-400',
    accent: 'text-indigo-600'
  };

  // Define animation classes
  const animationClasses = animated ? {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    ping: 'animate-ping',
    hover: 'transition-all duration-200 hover:scale-110 hover:text-blue-600',
    slide: 'transition-all duration-300 hover:translate-x-1',
    rotate: 'transition-transform duration-200 hover:rotate-12',
    shake: 'animate-shake',
    float: 'animate-float'
  } : {};

  // Define size presets
  const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12'
  };

  // Combine all classes
  const combinedClasses = [
    variantStyles[color] || variantStyles.default,
    animated ? animationClasses[animated] : '',
    sizeStyles[size] || '',
    className
  ].filter(Boolean).join(' ');

  return (
    <IconComponent 
      size={typeof size === 'string' ? undefined : size}
      className={combinedClasses}
      {...props}
    />
  );
};

// Professional icon presets for common use cases
export const ProfessionalIcons = {
  // Navigation icons
  Back: (props) => <Icon name="ArrowLeft" {...props} />,
  Next: (props) => <Icon name="ArrowRight" {...props} />,
  Home: (props) => <Icon name="Home" {...props} />,
  Menu: (props) => <Icon name="Menu" {...props} />,
  Close: (props) => <Icon name="X" {...props} />,
  
  // User action icons
  Profile: (props) => <Icon name="User" {...props} />,
  Login: (props) => <Icon name="LogIn" {...props} />,
  Logout: (props) => <Icon name="LogOut" {...props} />,
  Edit: (props) => <Icon name="Edit2" {...props} />,
  Save: (props) => <Icon name="Save" {...props} />,
  
  // Shopping icons
  Cart: (props) => <Icon name="ShoppingCart" {...props} />,
  ShoppingBag: (props) => <Icon name="ShoppingBag" {...props} />,
  Heart: (props) => <Icon name="Heart" {...props} />,
  Star: (props) => <Icon name="Star" {...props} />,
  
  // Order icons
  Package: (props) => <Icon name="Package" {...props} />,
  Truck: (props) => <Icon name="Truck" {...props} />,
  Check: (props) => <Icon name="Check" {...props} />,
  Clock: (props) => <Icon name="Clock" {...props} />,
  
  // Communication icons
  Mail: (props) => <Icon name="Mail" {...props} />,
  Phone: (props) => <Icon name="Phone" {...props} />,
  Message: (props) => <Icon name="MessageCircle" {...props} />,
  
  // Security icons
  Shield: (props) => <Icon name="Shield" {...props} />,
  Lock: (props) => <Icon name="Lock" {...props} />,
  Key: (props) => <Icon name="Key" {...props} />,
  
  // Status icons
  Success: (props) => <Icon name="CheckCircle" color="success" {...props} />,
  Error: (props) => <Icon name="XCircle" color="error" {...props} />,
  Warning: (props) => <Icon name="AlertTriangle" color="warning" {...props} />,
  Info: (props) => <Icon name="Info" color="primary" {...props} />,
  
  // Action icons
  Add: (props) => <Icon name="Plus" {...props} />,
  Remove: (props) => <Icon name="Minus" {...props} />,
  Delete: (props) => <Icon name="Trash2" color="error" {...props} />,
  Search: (props) => <Icon name="Search" {...props} />,
  Filter: (props) => <Icon name="Filter" {...props} />,
  
  // Payment icons
  CreditCard: (props) => <Icon name="CreditCard" {...props} />,
  DollarSign: (props) => <Icon name="DollarSign" {...props} />,
  
  // Location icons
  MapPin: (props) => <Icon name="MapPin" {...props} />,
  Globe: (props) => <Icon name="Globe" {...props} />,
  
  // Utility icons
  Settings: (props) => <Icon name="Settings" {...props} />,
  Help: (props) => <Icon name="HelpCircle" {...props} />,
  Download: (props) => <Icon name="Download" {...props} />,
  Upload: (props) => <Icon name="Upload" {...props} />,
  Refresh: (props) => <Icon name="RefreshCw" {...props} />,
  
  // Special decorative icons
  Sparkles: (props) => <Icon name="Sparkles" color="gradient" animated="pulse" {...props} />,
  TrendingUp: (props) => <Icon name="TrendingUp" color="success" {...props} />,
  Zap: (props) => <Icon name="Zap" color="warning" animated="pulse" {...props} />,
  Gift: (props) => <Icon name="Gift" color="accent" {...props} />
};

export default Icon;
