import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Truck, Package, Clock, DollarSign, MapPin, Globe, AlertCircle, CheckCircle, FileText, Settings, Phone, Mail, RotateCcw } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck size={40} className="text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Apna Decoration – Shipping Policy
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Reliable shipping for your party décor needs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Shipping Commitment</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  At Apna Decoration, we aim to provide a smooth, reliable, and satisfying shipping 
                  experience for all our customers. Please review the Shipping Policy below to understand how 
                  we handle the shipping and delivery of party décor products purchased from our online platform.
                </p>
              </div>
            </div>
          </div>

          {/* Order Processing */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Package size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Order Processing</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Once your order is placed and payment is confirmed, our team begins processing and 
              preparing your décor items for shipment.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Processing time may vary depending on product availability, customization, and order volume.
            </p>
            <p className="text-gray-600 italic leading-relaxed">
              We always strive to process orders as quickly as possible.
            </p>
          </div>

          {/* Shipping Time */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Shipping Time</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Shipping time refers to the time it takes for your package to travel from our facility to your 
              delivery address.
            </p>
            <p className="text-gray-600 mb-4">Delivery duration may vary based on:</p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                The shipping method selected
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Your location
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Courier partner timelines
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                External factors (weather, strikes, or logistical delays)
              </li>
            </ul>
          </div>

          {/* Shipping Costs */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign size={28} className="text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Shipping Costs</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Shipping charges are calculated based on:
            </p>
            <ul className="space-y-2 ml-6 mb-4">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Selected shipping method
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Weight and size of the package
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Delivery location
              </li>
            </ul>
            <p className="text-gray-600 italic">
              The final shipping cost will be displayed at checkout before you complete your purchase.
            </p>
          </div>

          {/* Tracking Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Tracking Information</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Once your order is shipped, we will provide a tracking number or link.
            </p>
            <p className="text-gray-600 italic leading-relaxed">
              You may use it to track your shipment and check the estimated delivery date.
            </p>
          </div>

          {/* International Shipping */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe size={28} className="text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">International Shipping</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Apna Decoration offers international shipping to select countries.
            </p>
            <p className="text-gray-600 mb-4">Please note:</p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                Customs fees, import duties, and taxes may apply as per your country's laws
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                Any additional charges for international shipments are the customer's responsibility
              </li>
            </ul>
          </div>

          {/* Delivery Issues */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={28} className="text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Delivery Issues</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We make every effort to ensure timely delivery.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              However, certain factors such as weather conditions, courier delays, or transportation issues 
              may be beyond our control.
            </p>
            <p className="text-gray-600 italic leading-relaxed">
              If you face any delivery issues, please contact our customer support team, and we will assist you promptly.
            </p>
          </div>

          {/* Address Accuracy */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={28} className="text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Address Accuracy</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Customers must provide accurate and complete shipping details at checkout.
            </p>
            <p className="text-gray-600 mb-4">
              Apna Decoration is not responsible for delays or misdeliveries caused by:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Incorrect address
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Missing landmarks
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Wrong contact information
              </li>
            </ul>
          </div>

          {/* Order Tracking */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We recommend checking your shipment status regularly using the tracking details provided.
            </p>
            <p className="text-gray-600 italic leading-relaxed">
              If you have concerns about your order status, contact our support team for assistance.
            </p>
          </div>

          {/* Returns & Exchanges */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h2>
            </div>
            <p className="text-gray-600 italic leading-relaxed">
              For returns or exchanges related to delivered products, please refer to our Returns & Refund Policy.
            </p>
          </div>

          {/* Policy Acceptance */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle size={28} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Policy Acceptance</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              By placing an order with Apna Decoration, you acknowledge that you have read, 
              understood, and agreed to our Shipping Policy.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Phone size={28} className="text-white" />
              <h2 className="text-2xl font-bold">Need Help?</h2>
            </div>
            <p className="text-white/90 mb-6">
              For questions or additional support, feel free to contact our customer service team.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <Phone size={20} />
                <span>+91 94092 74081</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Mail size={20} />
                <span>apnadecoration1@gmail.com</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shipping;
