
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, HelpCircle, Truck } from 'lucide-react';

export const SecondaryNavbar = () => {
  return (
    <div className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-8 py-2 text-sm">
          <Link 
            to="/customer-service" 
            className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
          >
            <Phone size={14} />
            <span>Customer Service</span>
          </Link>
          <Link 
            to="/contact" 
            className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
          >
            <Mail size={14} />
            <span>Contact Us</span>
          </Link>
          <Link 
            to="/shipping" 
            className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
          >
            <Truck size={14} />
            <span>Shipping</span>
          </Link>
          <Link 
            to="/help" 
            className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
