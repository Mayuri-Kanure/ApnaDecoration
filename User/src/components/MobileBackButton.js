import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MobileBackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`lg:hidden fixed top-4 right-4 z-50 bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default MobileBackButton;
