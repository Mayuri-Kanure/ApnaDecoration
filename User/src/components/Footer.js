import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock, Truck, Shield, Headphones
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribed:', email);
    setEmail('');
  };

  const quickLinks = [
    { name: 'Home', to: '/' },
    { name: 'About Us', to: '/about' },
    { name: 'Products', to: '/products' },
    { name: 'Services', to: '/services' },
    { name: 'Contact Us', to: '/contact' },
    { name: 'FAQ', to: '/faq' },
  ];

  const servicesLinks = [
    { name: 'Birthday Decorations', to: '/services/birthday' },
    { name: 'Wedding Decorations', to: '/services/wedding' },
    { name: 'Anniversary Setup', to: '/services/anniversary' },
    { name: 'Corporate Events', to: '/services/corporate' },
    { name: 'Festival Decorations', to: '/services/festival' },
    { name: 'Custom Themes', to: '/services/custom' },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-900 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="APNA DECORATION"
                className="h-20 w-auto"
              />
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                APNA DECORATION
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Premium printing solutions for businesses and individuals. We specialize in high-quality stickers, banners, business cards, and custom printing services that make your brand stand out.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-3 sm:space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-gray-100 hover:bg-blue-600 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-gray-100 hover:bg-pink-600 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="bg-gray-100 hover:bg-blue-400 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110">
                <Twitter size={18} />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Phone size={18} className="text-blue-400" />
                <span>+91 9167655524</span>
              </div>
              <a 
                href="https://wa.me/919167655524" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-colors duration-200"
              >
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <span>Chat on WhatsApp</span>
              </a>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <Mail size={18} className="text-blue-400" />
                <span>apna@decorations.com</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-200">
                <MapPin size={18} className="text-blue-400 mt-0.5" />
                <span>Mumbai, Maharashtra 400067</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.to} className="text-gray-300 hover:text-blue-400">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              {servicesLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.to} className="text-gray-300 hover:text-purple-400">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 border-t pt-8">
          <div className="flex items-center space-x-3 bg-gray-700 p-4 rounded-xl">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl text-white">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Fast Delivery</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Quick turnaround time</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-700 p-4 rounded-xl">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl text-white">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Quality Assured</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Premium materials</p>
            </div>
          </div>
          <Link 
            to="/support" 
            className="flex items-center space-x-3 bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl text-white">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">24/7 Support</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Always here to help</p>
            </div>
          </Link>
          <div className="flex items-center space-x-3 bg-gray-700 p-4 rounded-xl">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl text-white">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Expert Design</h4>
              <p className="text-gray-300 text-xs sm:text-sm">Professional assistance</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-white">Subscribe to Our Newsletter</h3>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} APNA DECORATION. All Rights Reserved.</p>
          <div className="flex space-x-4 text-xs mt-2 sm:mt-0">
            <Link to="/terms" className="text-gray-400 hover:text-blue-400">Terms</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-blue-400">Privacy</Link>
            <Link to="/refund" className="text-gray-400 hover:text-blue-400">Refund</Link>
            <Link to="/shipping" className="text-gray-400 hover:text-blue-400">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
