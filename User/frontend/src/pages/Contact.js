import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../contexts/ToastContext";
import apiService from "../services/api";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  ChevronLeft,
  Map,
  Globe,
  Headphones,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Award,
  CheckCircle,
} from "lucide-react";

const Contact = () => {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    company: "",
    priority: "medium",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handlePriorityChange = (priority) => {
    setFormData({ ...formData, priority });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      // Call real API service
      await apiService.sendContactMessage(formData);
      success("Message sent successfully! We'll get back to you soon.");
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      showError("Failed to send message. Please try again.");
      console.error("Contact form submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute top-0 right-0 translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl"></div>

        <div className="absolute inset-0 bg-black opacity-20"></div>
        {/* Back Button */}
        <div className="w-full px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>
        </div>
        <div className="relative w-full px-4 sm:px-6">
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="text-center">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Get in Touch
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
                  We're here to help and answer any question you might have
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
                    <span className="text-sm sm:text-base text-white/90">
                      24/7 Support
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
                    <span className="text-sm sm:text-base text-white/90">
                      Secure & Reliable
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
                    <span className="text-sm sm:text-base text-white/90">
                      Fast Response
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MessageSquare className="text-indigo-600" size={24} />
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <Phone size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-700"> 94092 74081</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Mail size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-700">
                        support@apnadecoration.com
                      </p>
                      <p className="text-gray-600 text-sm">
                        24/7 Response Time
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <MapPin size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Office</h3>
                      <p className="text-gray-700">12, Patel park, Tadwadi,</p>
                      <p className="text-gray-600 text-sm">Adajan, Surat</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Globe size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Website</h3>
                      <a
                        href="http://www.apnadecoration.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        www.apnadecoration.com
                      </a>
                      <p className="text-gray-600 text-sm">Available 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Headphones size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Support Hours
                      </h3>
                      <p className="text-gray-700">
                        Monday-Friday: 9AM-6PM EST
                      </p>
                      <p className="text-gray-600 text-sm">
                        Saturday: 10AM-4PM EST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 sm:mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Why Choose Apna Decoration?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div className="text-center">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 mx-auto mb-2" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        10,000+
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Happy Customers
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        5+ Years
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        In Business
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        24/7
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Expert Support
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        100%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Satisfaction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Send size={24} className="text-indigo-600" />
                Send us a Message
              </h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-600">
                    We'll get back to you within 24 hours.
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 px-6 py-3 rounded-lg transition-colors"
                    >
                      Send Another Message
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-800 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-describedby={
                          errors.name ? "name-error" : undefined
                        }
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 ${
                          errors.name
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-indigo-600"
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p
                          id="name-error"
                          className="mt-1 text-sm text-red-600"
                          role="alert"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-800 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-describedby={
                          errors.email ? "email-error" : undefined
                        }
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-indigo-600"
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p
                          id="email-error"
                          className="mt-1 text-sm text-red-600"
                          role="alert"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 ${
                        errors.phone
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-indigo-600"
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && (
                      <p
                        id="phone-error"
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-describedby={
                        errors.subject ? "subject-error" : undefined
                      }
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 ${
                        errors.subject
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-indigo-600"
                      }`}
                    >
                      <option value="">Select a topic...</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="quote">Request a Quote</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                    </select>
                    {errors.subject && (
                      <p
                        id="subject-error"
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                      >
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Standard request</option>
                      <option value="high">High - Urgent issue</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Company Name
                    </label>
                    <input
                      id="company"
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 ${
                        errors.company
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-indigo-600"
                      }`}
                      placeholder="Your Company Ltd."
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-800 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-describedby={
                        errors.message ? "message-error" : undefined
                      }
                      rows="6"
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none text-gray-700 ${
                        errors.message
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-indigo-600"
                      }`}
                      placeholder="Tell us more about your project or inquiry..."
                    ></textarea>
                    {errors.message && (
                      <p
                        id="message-error"
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
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
      </div>

      {/* FAQ Section */}
      <div className="w-full px-4 lg:px-6 py-16">
        <div className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Find quick answers to common questions about our services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How long does shipping take?
              </h3>
              <p className="text-gray-600 text-sm">
                Standard shipping takes 5-7 business days, while express
                shipping takes 2-3 business days.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What is your return policy?
              </h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day return policy for all unused items in original
                packaging.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer international shipping?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we ship worldwide. International shipping times vary by
                destination and typically take 7-14 business days.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How can I track my order?
              </h3>
              <p className="text-gray-600 text-sm">
                You'll receive a tracking number via email once your order ships
                to your destination.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
