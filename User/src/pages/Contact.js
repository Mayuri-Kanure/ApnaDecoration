import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, ChevronLeft } from 'lucide-react';

const Contact = () => {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call real API service
      await apiService.sendContactMessage(formData);
      success('Message sent successfully! We\'ll get back to you soon.');
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      showError('Failed to send message. Please try again.');
      console.error('Contact form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Get in touch with our team for any questions, support, or feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900">
                <MessageSquare size={24} className="text-blue-600" />
                Get in Touch
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Phone size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-700">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-600">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Mail size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-700">support@apnadecoration.com</p>
                    <p className="text-sm text-gray-600">24/7 Response Time</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <MapPin size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-700">123 Business Ave</p>
                    <p className="text-gray-700">Suite 100, New York, NY 10001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-black font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/faq" className="block text-blue-600 hover:text-blue-700 font-medium">
                  Frequently Asked Questions
                </Link>
                <Link to="/about" className="block text-blue-600 hover:text-blue-700 font-medium">
                  About Us
                </Link>
                <Link to="/products" className="block text-blue-600 hover:text-blue-700 font-medium">
                  Browse Products
                </Link>
                <Link to="/wishlist" className="block text-blue-600 hover:text-blue-700 font-medium">
                  My Wishlist
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl text-black font-semibold mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-600">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                        Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-600'
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-600'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                          errors.phone 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-600'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-2">
                        Subject *
                      </label>
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-describedby={errors.subject ? "subject-error" : undefined}
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                          errors.subject 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-600'
                        }`}
                        placeholder="How can we help?"
                      />
                      {errors.subject && (
                        <p id="subject-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-describedby={errors.message ? "message-error" : undefined}
                      rows="6"
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors resize-none ${
                        errors.message 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-600'
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="small" text="Sending..." />
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How long does shipping take?</h3>
              <p className="text-gray-600 text-sm">Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What is your return policy?</h3>
              <p className="text-gray-600 text-sm">We offer a 30-day return policy for all unused items in original packaging.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer international shipping?</h3>
              <p className="text-gray-600 text-sm">Yes, we ship worldwide. International shipping times vary by destination.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How can I track my order?</h3>
              <p className="text-gray-600 text-sm">You'll receive a tracking number via email once your order ships.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
