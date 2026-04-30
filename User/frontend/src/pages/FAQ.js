import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Phone,
  Mail,
  Truck,
  Shield,
  CreditCard,
  RefreshCw,
  Package,
  ShoppingBag,
  ChevronLeft,
  MessageSquare,
  Headphones,
} from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Dynamic quick help data with different content
  const quickHelp = [
    {
      title: "Call Us",
      description: "Speak directly with our support team",
      icon: Phone,
      contact: "+91 94092 74081",
      hours: "9AM-6PM EST",
    },
    {
      title: "Email Support",
      description: "Get help via email anytime",
      icon: Mail,
      contact: "support@apnadecoration.com",
      hours: "24/7 Response",
    },
    {
      title: "24/7 Support",
      description: "Get help anytime, anywhere",
      icon: Headphones,
      contact: (
        <Link
          to="/support"
          className="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          Contact Support
        </Link>
      ),
      hours: "Available 24/7",
    },
  ];

  const faqs = [
    {
      question: "What types of products do you offer?",
      answer:
        "We offer a wide range of premium decoration products including furniture, lighting, wall art, textiles, accessories, and more. All our products are carefully selected for quality and style.",
      category: "Products",
      icon: Package,
    },
    {
      question: "How do I place an order?",
      answer:
        "Simply browse our products, add items to your cart, and proceed to checkout. You can create an account for faster checkout and order tracking. We accept all major payment methods.",
      category: "Orders",
      icon: ShoppingBag,
    },
    {
      question: "What is the estimated delivery time?",
      answer:
        "Standard delivery takes 5-7 business days after order confirmation. Express delivery is available for 2-3 business days. International shipping times vary by destination.",
      category: "Shipping",
      icon: Truck,
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, PayPal, Apple Pay, Google Pay, and bank transfers. All online payments are processed securely through trusted payment gateways.",
      category: "Payment",
      icon: CreditCard,
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes! Once your order is shipped, you'll receive a tracking number via email. You can also track your order status by logging into your account and visiting the 'My Orders' section.",
      category: "Orders",
      icon: Package,
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for all unused items in original packaging. Simply contact our customer service team to initiate a return. Refunds are processed within 5-7 business days.",
      category: "Returns",
      icon: RefreshCw,
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship worldwide! International shipping rates and delivery times vary by destination. You can check shipping costs at checkout before completing your order.",
      category: "Shipping",
      icon: Truck,
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach our customer support team via email at support@apnadecoration.com, phone at +1 (555) 123-4567, or through our contact form. We're available Monday-Friday 9AM-6PM EST.",
      category: "Support",
      icon: MessageSquare,
    },
  ];

  const categories = [
    "All",
    "Products",
    "Orders",
    "Shipping",
    "Payment",
    "Returns",
    "Support",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFAQs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {quickHelp.map((item, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="text-xs text-purple-600 font-medium">
                  {item.contact}
                </div>
                <div className="text-xs text-gray-500">{item.hours}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="w-full lg:max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <faq.icon size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {faq.category}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  {activeIndex === index ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </button>
              {activeIndex === index && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our friendly customer support
            team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Topics
          </h2>
          <div className="grid lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Truck size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Shipping & Delivery
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn about shipping options, delivery times, and tracking
              </p>
              <Link
                to="/contact"
                className="text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <RefreshCw size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Returns & Refunds
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Our 30-day return policy and refund process
              </p>
              <Link
                to="/contact"
                className="text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <CreditCard size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Payment Options
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Accepted payment methods and secure checkout
              </p>
              <Link
                to="/contact"
                className="text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
