/**
 * Utility functions for clearance sale functionality
 */

/**
 * Check if clearance sale is still active based on end date
 * @param {string} endDate - The end date of the clearance sale
 * @returns {boolean} - True if sale is still active, false otherwise
 */
export const isClearanceSaleActive = (endDate) => {
  if (!endDate) return false;
  
  const now = new Date();
  const saleEnd = new Date(endDate);
  
  return now < saleEnd;
};

/**
 * Check if clearance sale data is valid and active
 * @param {Object} clearanceData - The clearance sale data object
 * @returns {boolean} - True if sale is active, false otherwise
 */
export const isClearanceSaleDataActive = (clearanceData) => {
  if (!clearanceData) return false;
  
  // Check if inhouse offer is active
  if (clearanceData.inhouseOffer?.isActive) {
    return isClearanceSaleActive(clearanceData.inhouseOffer.endDate);
  }
  
  // Check if any vendor offer is active
  if (clearanceData.vendorOffers && Array.isArray(clearanceData.vendorOffers)) {
    return clearanceData.vendorOffers.some(offer => 
      offer.isActive && isClearanceSaleActive(offer.endDate)
    );
  }
  
  return false;
};

/**
 * Format countdown timer display
 * @param {Date} expiryDate - The expiry date
 * @returns {Object} - Object with days, hours, minutes, seconds
 */
export const getCountdownTime = (expiryDate) => {
  const now = new Date().getTime();
  const expiry = new Date(expiryDate).getTime();
  const difference = expiry - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};
