import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, Database, Cookie, FileText, Mail, CheckCircle } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield size={40} className="text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Privacy Policy – Apna Decoration
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your privacy is our priority. Learn how we collect, use, and protect your information.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Privacy Commitment</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  At Apna Decoration, we are dedicated to safeguarding the privacy and security of our customers. 
                  This Privacy Policy explains how we collect, use, and protect your personal information when you 
                  visit our website or use our decoration products and services.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using our platform, you agree to the terms described below.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Database size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                1. Personal Information
              </h3>
              <p className="text-gray-600 mb-4">When you create an account or place an order, we may collect details such as:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Your name
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Email address
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Phone number
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Shipping/billing address
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Payment information
                </li>
              </ul>
              <p className="text-gray-600 mt-4 italic">This information is required to process and deliver your orders.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye size={20} className="text-purple-600" />
                2. Browsing Information
              </h3>
              <p className="text-gray-600 mb-4">We may collect non-personal data including:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  IP address
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Browser type
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Device details
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Pages visited and usage behavior
                </li>
              </ul>
              <p className="text-gray-600 mt-4 italic">This helps us improve website performance and user experience.</p>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Order Processing</h3>
              <p className="text-gray-600 mb-4">We use your information to:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Process and deliver your orders
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Communicate order updates
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Provide customer support
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Personalization</h3>
              <p className="text-gray-600 mb-4">Your data may be used to:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Recommend relevant products
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Customize your shopping experience
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Send targeted offers and marketing messages (only when consented)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Analytics & Improvement</h3>
              <p className="text-gray-600 mb-4">We analyze collected information to:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Improve website performance
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Enhance product offerings
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Optimize our marketing and service strategies
                </li>
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={28} className="text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Third-Party Service Providers</h3>
              <p className="text-gray-600 mb-4">We may share your information with trusted partners who assist in:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Order fulfillment
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Payment processing
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Shipping and logistics
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Website analytics
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Marketing activities
                </li>
              </ul>
              <p className="text-gray-600 mt-4 italic">These providers are obligated to protect your data and use it only for service-related purposes.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Legal Requirements</h3>
              <p className="text-gray-600 mb-4">We may disclose information if required:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  By law
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  By court order
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  To comply with government requests
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  To protect our legal rights or prevent fraud
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use industry-standard security technologies to protect your personal data from 
              unauthorized access, misuse, or disclosure.
            </p>
            <p className="text-gray-600 leading-relaxed italic">
              However, no online system is completely secure, and we cannot guarantee absolute protection.
            </p>
          </div>

          {/* Cookies & Tracking */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Cookie size={28} className="text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">Cookies & Tracking Technologies</h2>
            </div>
            <p className="text-gray-600 mb-4">We use cookies and similar tools to:</p>
            <ul className="space-y-2 ml-6 mb-4">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                Improve website functionality
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                Save your preferences
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                Analyze browsing patterns
              </li>
            </ul>
            <p className="text-gray-600 italic">
              You may disable cookies in your browser settings, but some website features may not function properly.
            </p>
          </div>

          {/* Third-Party Websites */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Websites</h2>
            <p className="text-gray-600 mb-4">
              Our website may contain links to external websites.
            </p>
            <p className="text-gray-600 mb-4">
              Apna Decoration is not responsible for their privacy practices or content.
            </p>
            <p className="text-gray-600 italic">
              We recommend reviewing the privacy policies of those websites before sharing any personal information.
            </p>
          </div>

          {/* Updates */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              Apna Decoration reserves the right to modify this Privacy Policy at any time.
            </p>
            <p className="text-gray-600 mb-4">
              Changes take effect immediately upon posting the updated version on our website.
            </p>
            <p className="text-gray-600 italic">
              We encourage you to review this policy periodically for updates.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Mail size={28} className="text-white" />
              <h2 className="text-2xl font-bold">Contact Us</h2>
            </div>
            <p className="text-white/90 mb-6">
              If you have any questions or concerns regarding this Privacy Policy or your personal 
              information, please contact us at:
            </p>
            <div className="flex items-center gap-3 text-white">
              <Mail size={20} />
              <span className="text-lg font-medium">apnadecoration1@gmail.com</span>
            </div>
          </div>

          {/* Acceptance */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Acceptance of Policy</h2>
            </div>
            <p className="text-gray-600 mb-4">
              By using our website or services, you confirm that:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                You have read and understood this Privacy Policy
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                You consent to the collection, use, and sharing of your information as described
              </li>
            </ul>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
