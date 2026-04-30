import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />;
      case "error":
        return <AlertCircle size={20} className="text-red-600" />;
      case "warning":
        return <AlertCircle size={20} className="text-yellow-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div
      className={`fixed right-4 max-w-sm w-full transition-all duration-300 transform ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
      style={{ 
        zIndex: 2000,
        top: "80px" // 64px navbar (h-16) + 16px padding
      }}
    >
      <div
        className={`${getBackgroundColor()} border-2 rounded-xl p-4 shadow-2xl backdrop-blur-sm relative overflow-hidden`}
      >
        {/* Animated background gradient for success messages */}
        {type === "success" && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 animate-pulse"></div>
        )}
        <div className="relative flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/50 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Manager Component
export const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Listen for custom toast events
    const handleToast = (event) => {
      const { message, type, duration } = event.detail;
      const id = Date.now();

      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    window.addEventListener("show-toast", handleToast);
    return () => window.removeEventListener("show-toast", handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div 
      className="fixed right-4 left-4 sm:left-auto sm:right-4 p-4 space-y-3 max-w-sm sm:max-w-md pointer-events-none"
      style={{
        zIndex: 2000,
        top: "80px" // Position below navbar (64px h-16 + 16px padding)
      }}
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="transform transition-all duration-300 pointer-events-auto"
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Utility function to show toasts
export const showToast = (message, type = "info", duration = 3000) => {
  const event = new CustomEvent("show-toast", {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
};

export default Toast;
