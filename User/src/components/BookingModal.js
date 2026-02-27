import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, FileText, Upload, Image } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';
import orderService from '../services/orderService';
import { useToast } from '../contexts/ToastContext';

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: service?._id || '',
    bookingDate: '',
    bookingTime: '',
    referenceImage: null,
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      specialRequests: ''
    }
  });

  // Update formData when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        serviceId: service._id || '',
        bookingDate: '',
        bookingTime: '',
        referenceImage: null,
        customerInfo: {
          name: '',
          email: '',
          phone: '',
          address: '',
          specialRequests: ''
        }
      });
    }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bookingDate || !formData.bookingTime) {
      showError('Please select booking date and time');
      return;
    }

    if (!formData.customerInfo.name || !formData.customerInfo.email || !formData.customerInfo.phone) {
      showError('Please fill in all required customer information');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('serviceId', formData.serviceId);
      formDataToSend.append('bookingDate', formData.bookingDate);
      formDataToSend.append('bookingTime', formData.bookingTime);
      formDataToSend.append('notes', formData.notes || '');
      
      // Add customer info as JSON string
      formDataToSend.append('customerInfo', JSON.stringify(formData.customerInfo));
      
      // Add reference image if selected
      if (formData.referenceImage) {
        formDataToSend.append('referenceImage', formData.referenceImage);
      }

      const booking = await orderService.createServiceBooking(formDataToSend);
      success('Service booking created successfully!');
      onSuccess(booking);
      onClose();
      // Reset form
      setFormData({
        serviceId: service?._id || '',
        bookingDate: '',
        bookingTime: '',
        referenceImage: null,
        customerInfo: {
          name: '',
          email: '',
          phone: '',
          address: '',
          specialRequests: ''
        }
      });
    } catch (error) {
      showError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Only image files are allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        referenceImage: file
      }));
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Book Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Service Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-4">
            {service.image && (
              <img
                src={`${IMAGE_BASE_URL}${service.image}`}
                alt={service.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-2 line-clamp-2">{service.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{service.duration}</span>
                </div>
                <div className="text-xl font-bold text-indigo-600">
                  ₹{service.price}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Booking Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.bookingDate}
                  onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Preferred Time
                </label>
                <select
                  required
                  value={formData.bookingTime}
                  onChange={(e) => handleInputChange('bookingTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Image size={20} />
                Reference Image (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                Upload a reference image to help us understand your decoration requirements better
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                {formData.referenceImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(formData.referenceImage)}
                        alt="Reference"
                        className="max-w-xs max-h-48 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, referenceImage: null }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{formData.referenceImage.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <div>
                      <label htmlFor="referenceImage" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                          Upload Reference Image
                        </span>
                        <input
                          id="referenceImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={20} />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerInfo.name}
                    onChange={(e) => handleInputChange('customerInfo.name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerInfo.email}
                    onChange={(e) => handleInputChange('customerInfo.email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerInfo.phone}
                    onChange={(e) => handleInputChange('customerInfo.phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Address
                  </label>
                  <textarea
                    value={formData.customerInfo.address}
                    onChange={(e) => handleInputChange('customerInfo.address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Your address for service delivery"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Special Requests
                </label>
                <textarea
                  value={formData.customerInfo.specialRequests}
                  onChange={(e) => handleInputChange('customerInfo.specialRequests', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requirements or requests..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
