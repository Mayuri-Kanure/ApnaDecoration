import React from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
  FileText,
  User,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  AlertCircle,
  Eye,
  Settings,
  CheckCircle,
} from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-center">
            <FileText size={40} className="text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Apna Decoration – Terms & Conditions
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Welcome to Apna Decoration! Please read our terms carefully.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-5xl xl:max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Apna Decoration!
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  These Terms & Conditions outline the agreement between you
                  (the user) and Apna Decoration, the provider of party décor
                  products and decoration services through our online platform.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using our website or services, you agree to
                  comply with the terms stated below.
                </p>
              </div>
            </div>
          </div>

          {/* Account Registration */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <User size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                1. Account Registration
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              To make purchases or access certain features, you may be required
              to create an account.
            </p>
            <p className="text-gray-600 mb-4">You are responsible for:</p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <CheckCircle size={16} className="text-green-600" />
                Providing accurate and complete information during registration
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <CheckCircle size={16} className="text-green-600" />
                Maintaining the confidentiality of your login details
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <CheckCircle size={16} className="text-green-600" />
                All activities that occur under your account
              </li>
            </ul>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Package size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                2. Product Information
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              We strive to provide accurate descriptions, pricing, images, and
              availability details of all décor products.
            </p>
            <p className="text-gray-600 mb-4">However:</p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Minor errors or updates may occur
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Apna Decoration reserves the right to modify product information
                anytime when necessary
              </li>
            </ul>
          </div>

          {/* Ordering & Payments */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                3. Ordering & Payments
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              By placing an order with Apna Decoration, you agree to:
            </p>
            <ul className="space-y-2 ml-6 mb-4">
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <CheckCircle size={16} className="text-blue-600" />
                Pay the listed price for selected products or services
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <CheckCircle size={16} className="text-blue-600" />
                Pay any applicable taxes or shipping charges
              </li>
            </ul>
            <p className="text-gray-600 italic">
              Payments are processed securely through trusted payment gateways.
            </p>
          </div>

          {/* Shipping & Delivery */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Truck size={28} className="text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                4. Shipping & Delivery
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              We aim to deliver orders within the estimated time.
            </p>
            <p className="text-gray-600 mb-4">
              However, delivery dates cannot be guaranteed due to courier delays
              or unforeseen circumstances.
            </p>
            <p className="text-gray-600 italic">
              Please review our Shipping Policy for detailed information.
            </p>
          </div>

          {/* Returns & Refunds */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw size={28} className="text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                5. Returns & Refunds
              </h2>
            </div>
            <p className="text-gray-600 italic">
              If you face any issue with the product or service, please refer to
              our Returns & Refund Policy to understand eligibility, timelines,
              and procedures.
            </p>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={28} className="text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                6. Intellectual Property
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              All content on the Apna Decoration website—including:
            </p>
            <ul className="space-y-2 ml-6 mb-4">
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Text
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Images
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Graphics
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Logos
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Designs
              </li>
            </ul>
            <p className="text-gray-600">
              is protected by copyright and intellectual property laws.
            </p>
            <p className="text-gray-600 mt-4">
              You may not copy, modify, distribute, or use any content without
              our written permission.
            </p>
          </div>

          {/* User Conduct */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={28} className="text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                7. User Conduct
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              By using our website, you agree:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                Not to engage in unlawful activities
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                Not to disrupt or damage the website or its security
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                Not to misuse features, data, or copyrighted materials
              </li>
            </ul>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye size={28} className="text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">8. Privacy</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Your personal information is handled according to our Privacy
              Policy.
            </p>
            <p className="text-gray-600 italic">
              By using our platform, you consent to the collection and use of
              your information as described in that policy.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={28} className="text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                9. Limitation of Liability
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Apna Decoration is not responsible for:
            </p>
            <ul className="space-y-2 ml-6 mb-4">
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                Any indirect, incidental, or consequential damages
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                Losses resulting from website use
              </li>
              <li className="flex items-start gap-2 text-gray-600 break-words">
                <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                Issues arising from third-party delivery services
              </li>
            </ul>
            <p className="text-gray-600 italic">
              Your use of our products and website is at your own discretion and
              risk.
            </p>
          </div>

          {/* Modifications */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                10. Modifications
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Apna Decoration reserves the right to update or modify these Terms
              & Conditions at any time.
            </p>
            <p className="text-gray-600 mb-4">
              Changes take effect immediately once posted on the website.
            </p>
            <p className="text-gray-600 italic">
              You are advised to review the terms periodically.
            </p>
          </div>

          {/* Acceptance */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle size={28} className="text-white" />
              <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
            </div>
            <p className="text-white/90 mb-6">
              By using the Apna Decoration website or placing an order, you
              acknowledge that:
            </p>
            <ul className="space-y-3 ml-6 mb-6">
              <li className="flex items-center gap-3 text-white/90">
                <CheckCircle size={20} className="text-white" />
                You have read and understood these Terms & Conditions
              </li>
              <li className="flex items-center gap-3 text-white/90">
                <CheckCircle size={20} className="text-white" />
                You agree to follow all the policies mentioned
              </li>
            </ul>
            <p className="text-white/90 italic">
              If you do not agree with any part of these terms, please refrain
              from using our website or making purchases.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
