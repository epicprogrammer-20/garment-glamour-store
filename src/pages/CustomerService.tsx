
import React from 'react';
import { Header } from '../components/Header';
import { SecondaryNavbar } from '../components/SecondaryNavbar';
import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const CustomerService = () => {
  return (
    <div className="min-h-screen bg-white">
      <SecondaryNavbar />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're here to help! Our customer service team is dedicated to providing you with the best shopping experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center mb-4">
              <Phone className="text-purple-600 mr-3" size={24} />
              <h3 className="text-xl font-semibold">Phone Support</h3>
            </div>
            <p className="text-gray-600 mb-4">Speak directly with our customer service team</p>
            <p className="font-semibold text-lg">+1 (555) 123-4567</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center mb-4">
              <Mail className="text-purple-600 mr-3" size={24} />
              <h3 className="text-xl font-semibold">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">Send us your questions and we'll respond within 24 hours</p>
            <p className="font-semibold">support@luxe.com</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center mb-4">
              <MessageCircle className="text-purple-600 mr-3" size={24} />
              <h3 className="text-xl font-semibold">Live Chat</h3>
            </div>
            <p className="text-gray-600 mb-4">Chat with us instantly for quick assistance</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Start Chat
            </button>
          </div>
        </div>

        <div className="mt-12 bg-gray-50 p-8 rounded-lg">
          <div className="flex items-center mb-4">
            <Clock className="text-purple-600 mr-3" size={24} />
            <h3 className="text-xl font-semibold">Business Hours</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <p><strong>Monday - Friday:</strong> 9:00 AM - 8:00 PM EST</p>
              <p><strong>Saturday:</strong> 10:00 AM - 6:00 PM EST</p>
            </div>
            <div>
              <p><strong>Sunday:</strong> 12:00 PM - 5:00 PM EST</p>
              <p><strong>Holidays:</strong> Closed</p>
            </div>
          </div>
        </div>
      </div>
      <Cart />
      <Footer />
    </div>
  );
};

export default CustomerService;
