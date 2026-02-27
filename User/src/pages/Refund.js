import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { RotateCcw, Package, CreditCard, Calendar, AlertCircle, Shield, Camera, MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Settings, User } from 'lucide-react';

const Refund = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RotateCcw size={40} className="text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Apna Decoration – Refund & Service Policy
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your satisfaction is our priority. Learn about our refund and service policies.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <RotateCcw size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Apna Decoration!</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We are committed to delivering a smooth and satisfying experience with every purchase and 
                  service you choose. This policy outlines the terms for product returns, cancellations, refunds, 
                  event service guidelines, and overall conditions for both DIY décor products and professional 
                  decoration services.
                </p>
              </div>
            </div>
          </div>

          {/* Product Return & Refund Policy */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Package size={28} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">1. Product Return & Refund Policy (DIY Products)</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Returns & Exchanges</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Eligibility:
                </h4>
                <p className="text-gray-600 ml-7">
                  We accept returns/exchanges for unused and unopened décor items within 7 days of delivery.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Condition:
                </h4>
                <p className="text-gray-600 ml-7">
                  Items must be in original packaging and in unused, saleable condition.
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <XCircle size={20} className="text-red-600" />
                  Exclusions (Non-Returnable Items):
                </h4>
                <ul className="space-y-2 ml-7">
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Perishable items
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Customized/personalized products
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Final sale items
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Used or damaged items
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Return Process</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Initiate Return:</h4>
                    <p className="text-gray-600">
                      Contact our customer support with order details, reason for return, and any supporting photos if needed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Approval:</h4>
                    <p className="text-gray-600">
                      Once approved, you will receive a Return Authorization Number and instructions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping:</h4>
                    <p className="text-gray-600">
                      Customer bears return shipping cost. Use trackable/insured shipping.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Refund/Exchange:</h4>
                    <p className="text-gray-600">
                      After product inspection, refund or exchange will be processed as per your preference.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Refunds</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <CreditCard size={16} className="text-green-600" />
                  Refund covers product cost only. Shipping charges are non-refundable.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CreditCard size={16} className="text-green-600" />
                  Processed to the original payment method after approval.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <CreditCard size={16} className="text-green-600" />
                  Bank/payment provider timelines may vary.
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Cancellations (DIY Products)</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} className="text-orange-600" />
                  Orders can be cancelled before shipment by contacting support.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} className="text-orange-600" />
                  Once shipped or processed, cancellation is not possible—but you may return as per policy.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Damaged or Defective Items</h3>
              <p className="text-gray-600 mb-3">If you receive a damaged/defective product:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <Camera size={16} className="text-red-600" />
                  Contact us immediately with photos and order details.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <RotateCcw size={16} className="text-red-600" />
                  We will arrange a replacement or refund after verification.
                </li>
              </ul>
            </div>
          </div>

          {/* Service Policy */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">2. Service Policy (Event Decoration Services)</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancellation & Refund Terms</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-gray-50 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-4 py-3 text-left">Notice Period</th>
                      <th className="px-4 py-3 text-left">Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-700">More than 7 days before event</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">100% Refund</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-700">168 to 72 hours before event</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">90% Refund</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-700">72 to 48 hours before event</td>
                      <td className="px-4 py-3 text-orange-600 font-semibold">50% Refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Less than 48 hours</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">No Refund</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Dates (No Refund):</h3>
              <p className="text-gray-600 mb-3">
                No refunds will be given for orders or services cancelled/returned on:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <XCircle size={16} className="text-red-600" />
                  February 13–14
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <XCircle size={16} className="text-red-600" />
                  December 25
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <XCircle size={16} className="text-red-600" />
                  December 31
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <XCircle size={16} className="text-red-600" />
                  January 1
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <XCircle size={16} className="text-red-600" />
                  Other special and festival days
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Non-Refundable Situations</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Customer refuses service delivery
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Decoration setup has already started
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Incorrect or delayed venue access affecting setup
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Customer unavailability during setup
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Force Majeure</h3>
              <p className="text-gray-600 mb-3">
                Natural disasters, government restrictions, or unexpected events:
              </p>
              <p className="text-gray-600 italic">
                Refunds/rescheduling will be handled case-by-case based on feasibility and vendor agreements.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking & Payment Terms</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <CreditCard size={16} className="text-green-600" />
                  Full payment is required for booking confirmation.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-blue-600" />
                  Bookings depend on slot availability.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} className="text-orange-600" />
                  Prices may vary for:
                </li>
              </ul>
              <ul className="space-y-2 ml-12 mt-2">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Customizations
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Distance/location
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Special requests
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Timing & Execution</h3>
              <ul className="space-y-2 ml-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-purple-600" />
                  Setup is completed within a selected time slot.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} className="text-orange-600" />
                  Delay in venue access may affect decoration quality; refunds are not applicable.
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={16} className="text-orange-600" />
                  Decorations are designed to last for a limited number of hours; natural wear is not covered.
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rescheduling</h3>
              <p className="text-gray-600">
                One free rescheduling allowed if requested 48 hours before the event.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Substitutions</h3>
              <p className="text-gray-600">
                If an item is unavailable, we may replace it with an item of equal or higher value that fits the theme.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rental Items</h3>
              <p className="text-gray-600 mb-3">Items like:</p>
              <ul className="space-y-2 ml-6 mb-4">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Metal stands
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Marquee lights
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Sequin panels
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Cutouts
                </li>
              </ul>
              <p className="text-gray-600 mb-3">Must be returned within 24 hours.</p>
              <p className="text-gray-600 italic">
                Customer is responsible for any loss, damage, or theft.
              </p>
            </div>
          </div>

          {/* Venue & Setup Requirements */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={28} className="text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Venue & Setup Requirements</h2>
            </div>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                For ceiling work, customer must provide a ladder/stool.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Ensure power supply availability; provide extension cords if needed.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Tape used during décor must be removed soon after the event to avoid wall damage.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Additional on-site requests will incur extra charges.
              </li>
            </ul>
          </div>

          {/* On-Site Guidelines */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={28} className="text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">3. On-Site Guidelines</h2>
            </div>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <User size={16} className="text-teal-600" />
                A customer representative must be present during setup.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Clock size={16} className="text-orange-600" />
                Decorators will wait a maximum of 30 minutes beyond scheduled time.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <AlertCircle size={16} className="text-yellow-600" />
                Balloon burst due to sunlight/heat is not covered.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <XCircle size={16} className="text-red-600" />
                Any harassment or inappropriate behavior toward staff will result in service termination and potential legal action.
              </li>
            </ul>
          </div>

          {/* Photography & Marketing */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Camera size={28} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">4. Photography & Marketing</h2>
            </div>
            <p className="text-gray-600 mb-4">
              We may photograph or video the décor setup for promotional purposes.
            </p>
            <p className="text-gray-600 italic">
              If you prefer not to allow this, please notify us at the time of booking.
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={28} className="text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">5. Legal Disclaimer & Liability</h2>
            </div>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                We are not responsible for property damage due to adhesives unless caused by proven negligence.
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <AlertCircle size={16} className="text-orange-600" />
                Customer must inform us beforehand of any safety risks:
              </li>
            </ul>
            <ul className="space-y-2 ml-12 mt-2 mb-4">
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Candles
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Electrical hazards
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                Fragile items
              </li>
            </ul>
            <p className="text-gray-600 italic">
              Images on our website or social media are illustrative; actual results may vary based on item availability and venue constraints.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Phone size={28} className="text-white" />
              <h2 className="text-2xl font-bold">Contact Us</h2>
            </div>
            <p className="text-white/90 mb-6">
              For questions or assistance, reach us at:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <MapPin size={20} />
                <span>Apna Decoration<br />
                12, Patel Park, Tadwadi, Adajan, Surat</span>
              </div>
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

          {/* Final Agreement */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={28} className="text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Agreement</h2>
            </div>
            <p className="text-gray-600">
              By booking a service or purchasing a product from Apna Decoration, you agree to the above terms and conditions.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Refund;
