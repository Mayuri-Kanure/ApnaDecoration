import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
  Truck,
  Shield,
  Headphones,
} from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log("Subscribed:", email);

    const event = new CustomEvent("show-toast", {
      detail: {
        message: `Thank you for subscribing with email: ${email}`,
        type: "success",
        duration: 5000,
      },
    });
    window.dispatchEvent(event);
    setEmail("");
  };

  const quickLinks = [
    { name: "Home", to: "/" },
    { name: "About Us", to: "/about" },
    { name: "Products", to: "/products" },
    { name: "Services", to: "/services" },
    { name: "Contact Us", to: "/contact" },
    { name: "FAQ", to: "/faq" },
  ];

  const servicesLinks = [
    { name: "Birthday Decorations", to: "/services/birthday" },
    { name: "Wedding Decorations", to: "/services/wedding" },
    { name: "Anniversary Setup", to: "/services/anniversary" },
    { name: "Corporate Events", to: "/services/corporate" },
    { name: "Festival Decorations", to: "/services/festival" },
    { name: "Custom Themes", to: "/services/custom" },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white border-t border-gray-800">
      {/* CHANGED: Expanded max-w wrapper to full width to stay matched with your navigation bar style rules */}
      <div className="max-w-full mx-auto px-6 sm:px-10 lg:px-16 py-14">
        {/* Main Content Grid Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand & Contact Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="APNA DECORATION"
                className="h-16 w-auto object-contain rounded-xl bg-white/5 p-1"
              />
              <div>
                <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  APNA DECORATION
                </h2>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Celebration Made Perfect
                </p>
              </div>
            </div>

            {/* ✅ FIXED: Description changed to match Apna Decoration event context instead of corporate printing copy layout */}
            <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-xl">
              Your one-stop destination for premium event styling and curated
              party packages. We specialize in custom theme designs,
              breath-taking balloon installations, and professional on-site
              setup management that turns your special moments into
              unforgettable memories.
            </p>

            {/* Social Icons Cards row */}
            <div className="flex items-center space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl p-2.5 transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="bg-gray-800 hover:bg-pink-600 text-gray-400 hover:text-white rounded-xl p-2.5 transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="bg-gray-800 hover:bg-blue-400 text-gray-400 hover:text-white rounded-xl p-2.5 transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
              >
                <Twitter size={16} />
              </a>
            </div>

            {/* Contact details list wrapper block */}
            <div className="space-y-3 pt-2 text-xs font-semibold text-gray-400">
              <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors duration-200">
                <Phone size={15} className="text-blue-400" />
                <span>+91 9167655524</span>
              </div>
              <a
                href="https://wa.me/919167655524"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 hover:text-green-400 transition-all duration-200"
              >
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-black text-[9px]">W</span>
                </div>
                <span>Chat on WhatsApp</span>
              </a>
              <div className="flex items-center space-x-3 hover:text-blue-400 transition-colors duration-200">
                <Mail size={15} className="text-blue-400" />
                <span>apna@decorations.com</span>
              </div>
              <div className="flex items-start space-x-3 hover:text-blue-400 transition-colors duration-200">
                <MapPin size={15} className="text-blue-400" />
                <span>Mumbai, Maharashtra 400067</span>
              </div>
            </div>
          </div>

          {/* Quick Links Nav block Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-sm font-semibold text-gray-300 hover:text-blue-400 transition-colors py-1 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Category Nav block Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {servicesLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors py-1 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature badges flex display container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14 border-t border-gray-800 pt-8">
          <Link
            to="/products"
            className="flex items-center space-x-4 bg-gray-800/40 border border-gray-800/60 p-4 rounded-xl hover:bg-gray-800 transition-all"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-lg text-white shadow-md">
              <Truck size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fast Delivery</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Quick turnaround times
              </p>
            </div>
          </Link>

          <Link
            to="/about"
            className="flex items-center space-x-4 bg-gray-800/40 border border-gray-800/60 p-4 rounded-xl hover:bg-gray-800 transition-all"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 rounded-lg text-white shadow-md">
              <Shield size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Quality Assured</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Premium curated decor
              </p>
            </div>
          </Link>

          <Link
            to="/support"
            className="flex items-center space-x-4 bg-gray-800/40 border border-gray-800/60 p-4 rounded-xl hover:bg-gray-800 transition-all"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2.5 rounded-lg text-white shadow-md">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Support</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Always here to help
              </p>
            </div>
          </Link>

          <Link
            to="/contact"
            className="flex items-center space-x-4 bg-gray-800/40 border border-gray-800/60 p-4 rounded-xl hover:bg-gray-800 transition-all"
          >
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2.5 rounded-lg text-white shadow-md">
              <Headphones size={16} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Expert Design</h4>
              <p className="text-gray-400 text-xs mt-0.5">
                Professional styling team
              </p>
            </div>
          </Link>
        </div>

        {/* Stretched clean newsletter section box */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-bold text-white">
              Subscribe to our newsletter
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Get early access to festive offers and new package themes.
            </p>
          </div>
          <form
            className="flex w-full lg:w-auto max-w-md gap-3"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 lg:w-64 px-4 py-2 text-sm rounded-xl border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar Context Node */}
      <div className="bg-gray-950/80 border-t border-gray-950 py-4">
        {/* MATCHED WRAPPER: Matches outer padding vectors */}
        <div className="max-w-full mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-semibold text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} APNA DECORATION. All Rights
            Reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/terms" className="hover:text-blue-400 transition-colors">
              Terms
            </Link>
            <Link
              to="/privacy"
              className="hover:text-blue-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/refund"
              className="hover:text-blue-400 transition-colors"
            >
              Refund
            </Link>
            <Link
              to="/shipping"
              className="hover:text-blue-400 transition-colors"
            >
              Shipping
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
