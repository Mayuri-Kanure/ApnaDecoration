import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = "", to = -1, label = "Back" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === -1) {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label={label}
    >
      <ArrowLeft size={16} />
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </button>
  );
};

export default BackButton;
