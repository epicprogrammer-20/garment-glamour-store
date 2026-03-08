
import React from 'react';
import { Header } from '../components/Header';
import { SecondaryNavbar } from '../components/SecondaryNavbar';
import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { Phone, Mail, Clock, MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CustomerService = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <SecondaryNavbar />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button 
          variant="outline" 
          onClick={handleGoBack}
          className="mb-6 hover:bg-blue-50 border-blue-200 text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

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
            <a href="tel:0783720685" className="font-semibold text-lg text-purple-600 hover:underline">
              0783720685
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center mb-4">
              <Mail className="text-purple-600 mr-3" size={24} />
              <h3 className="text-xl font-semibold">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">Send us your questions and we'll respond within 24 hours</p>
            <a href="mailto:auraclothing@gmail.com" className="font-semibold text-purple-600 hover:underline">
              auraclothing@gmail.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center mb-4">
              <MessageCircle className="text-gray-400 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-500">Live Chat</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-amber-500" size={16} />
              <p className="text-amber-600 text-sm font-medium">Currently Unavailable</p>
            </div>
            <p className="text-gray-500 text-sm">
              Live chat is temporarily unavailable. Please contact us via email at{' '}
              <a href="mailto:auraclothing@gmail.com" className="text-purple-600 hover:underline">
                auraclothing@gmail.com
              </a>
            </p>
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
