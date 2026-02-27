import React, { createContext, useState, useContext } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    fullName: 'PrintForMee',
    phoneNumber: '',
    email: 'admin@gmail.com',
    profilePhoto: null
  });

  const updateProfile = (newData) => {
    setProfileData(prev => ({
      ...prev,
      ...newData
    }));
    
    // Update localStorage to persist changes
    localStorage.setItem('userProfile', JSON.stringify({
      ...profileData,
      ...newData
    }));
  };

  // Load profile from localStorage on mount
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
