import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  className = '',
  variant = 'spinner',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  if (variant === 'skeleton') {
    return <SkeletonLoader className={className} />;
  }

  if (variant === 'card') {
    return <CardSkeleton className={className} />;
  }

  if (variant === 'list') {
    return <ListSkeleton className={className} />;
  }

  return (
    <div className={`${containerClasses} gap-2 ${className}`} role="status" aria-live="polite">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`}
      />
      {text && (
        <span className="text-sm text-gray-600">
          {text}
        </span>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
};

// Skeleton Loader Component
const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

// Card Skeleton for Products/Orders
const CardSkeleton = ({ className = '' }) => (
  <div className={`border rounded-lg p-4 animate-pulse ${className}`}>
    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded"></div>
  </div>
);

// List Skeleton for Orders/Items
const ListSkeleton = ({ className = '', items = 3 }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export { LoadingSpinner, SkeletonLoader, CardSkeleton, ListSkeleton };
export default LoadingSpinner;
