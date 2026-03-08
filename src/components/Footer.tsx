
import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">AURA</h3>
            <p className="text-gray-400">
              Elevating style with premium fashion pieces for the modern lifestyle.
            </p>
            <div className="space-y-2 text-gray-400">
              <a href="mailto:auraclothing@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={16} />
                auraclothing@gmail.com
              </a>
              <a href="tel:0783720685" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={16} />
                0783720685
              </a>
            </div>
          </div>
          
          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/women" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/men" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/sale" className="hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/customer-service" className="hover:text-white transition-colors">Customer Service</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition-colors flex items-center gap-1">📦 Track Your Order</Link></li>
              <li><Link to="/refund" className="hover:text-white transition-colors flex items-center gap-1">🔄 Request a Refund</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe for updates and exclusive offers</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 text-white placeholder-gray-500 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-r-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 AURA Clothing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
