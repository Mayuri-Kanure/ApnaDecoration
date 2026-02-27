import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Sparkles, Heart, Target, Users, Package, Shield, CheckCircle, Star, ChevronLeft } from 'lucide-react';

const About = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const carouselImages = [
    {
      url: '/birthday.jpeg',
      alt: 'Party Decorations Collection',
    },
    {
      url: '/1711520474508.png', 
      alt: 'APNA DECORATION Logo',
    },
    {
      url: '/birthday1.webp',
      alt: 'Celebration Supplies',
    },
     {
      url: '/stats-1.jpg',
      alt: 'Celebration Supplies',
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Us – Apna Decoration
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your premier destination for party decorations and home décor
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Main About Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={32} className="text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Who We Are</h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We are a premier online retailer specializing in party decorations, party supplies, and 
                home décor items. At Apna Decoration, our mission is to create unforgettable experiences 
                and transform spaces into vibrant, joyful settings for every celebration.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Whether it's a birthday, anniversary, baby shower, wedding, or any special occasion, we 
                offer a wide range of party decorations to add that perfect touch of sparkle to your event.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From colorful balloons to elegant banners and themed décor, we have everything you need to 
                make your celebrations truly memorable.
              </p>
            </div>
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl h-96 overflow-hidden">
              {/* Image Carousel */}
              <div className="relative w-full h-full">
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-blue-100', 'to-purple-100');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                  </div>
                ))}
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Commitment */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Shield size={32} className="text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">Our Quality Commitment</h2>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed text-lg">
            We are committed to delivering high-quality products that meet your expectations. Every 
            party décor and home décor item is carefully sourced from trusted suppliers to ensure 
            durability, aesthetics, and safety. Your satisfaction is our top priority, and we aim to exceed 
            your expectations through our products and customer service.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <span className="text-gray-700">Premium Quality</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <span className="text-gray-700">Trusted Suppliers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <span className="text-gray-700">Customer Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Shopping Experience */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Heart size={32} className="text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">Your Shopping Experience</h2>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed text-lg">
            At Apna Decoration, we strive to make your shopping experience enjoyable and hassle-free. 
            Our user-friendly website offers easy navigation, detailed product descriptions, and 
            vibrant visuals to help you make informed decisions. We continuously update our inventory 
            with the latest trends and designs, ensuring you have access to the most stylish and unique 
            party and home décor items.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Package size={32} className="text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Wide Selection</h3>
              <p className="text-gray-600 text-sm">Extensive collection of party and home décor items</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Star size={32} className="text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Latest Trends</h3>
              <p className="text-gray-600 text-sm">Always updated with newest designs and styles</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <Users size={32} className="text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy Navigation</h3>
              <p className="text-gray-600 text-sm">User-friendly website design for smooth shopping</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <Target size={32} className="text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Detailed Info</h3>
              <p className="text-gray-600 text-sm">Comprehensive product descriptions and visuals</p>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users size={32} className="text-white" />
            <h2 className="text-3xl font-bold">Join Our Apna Decoration Community</h2>
          </div>
          <p className="text-white/90 mb-8 leading-relaxed text-lg">
            We value our customers and believe in building lasting relationships. Join our community to 
            stay updated on new arrivals, exclusive promotions, and party planning tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Explore Collection
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
            >
              Join Community
            </Link>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Thank You for Choosing Us</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            Thank you for choosing Apna Decoration as your go-to destination for party and home 
            décor. We are excited to be part of your celebrations and help you create a home and events 
            that reflect your personal style.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg italic text-center">
            Explore our collection, unleash your creativity, and let Apna 
            Decoration make your moments truly memorable.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default About;
