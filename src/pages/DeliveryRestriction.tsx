
import React from 'react';
import { Header } from '../components/Header';

import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { MapPin, MessageCircle, Calendar, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DeliveryRestriction = () => {
  const navigate = useNavigate();
  const whatsappNumber = "+1234567890";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi, I would like to place a special order for delivery to my location.`;

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <SecondaryNavbar />
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button 
          variant="outline" 
          onClick={handleGoBack}
          className="mb-6 hover:bg-blue-50 border-blue-200 text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        <div className="text-center mb-12">
          <MapPin className="mx-auto text-orange-500 mb-6" size={64} />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Deliveries to your location are not available yet
          </h1>
          <p className="text-gray-600 text-lg">
            But don't worry! We have a special solution for you.
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Special Order Available</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Click the number below to chat with an assistant on WhatsApp to obtain a special order. 
              Your product will be delivered when our brand is coming to your town or location on specific dates. 
              You'll be notified days before arrival.
            </p>
            
            <div className="flex justify-center items-center space-x-6 mb-8">
              <div className="flex items-center text-green-600">
                <Calendar className="mr-2" size={20} />
                <span>Scheduled Delivery</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Bell className="mr-2" size={20} />
                <span>Advance Notification</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageCircle className="mr-3" size={24} />
              Chat on WhatsApp: {whatsappNumber}
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border text-center">
            <Calendar className="mx-auto text-purple-600 mb-4" size={32} />
            <h3 className="font-semibold text-lg mb-2">Scheduled Visits</h3>
            <p className="text-gray-600 text-sm">
              We visit different regions on scheduled dates throughout the year
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border text-center">
            <Bell className="mx-auto text-purple-600 mb-4" size={32} />
            <h3 className="font-semibold text-lg mb-2">Advance Notice</h3>
            <p className="text-gray-600 text-sm">
              Get notified 3-5 days before we arrive in your area
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border text-center">
            <MessageCircle className="mx-auto text-purple-600 mb-4" size={32} />
            <h3 className="font-semibold text-lg mb-2">Personal Service</h3>
            <p className="text-gray-600 text-sm">
              Chat directly with our team for personalized assistance
            </p>
          </div>
        </div>

        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">How it works:</h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
              Click the WhatsApp button above to start a conversation
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
              Tell us your location and what products you're interested in
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
              We'll check our schedule and let you know when we'll be in your area
            </li>
            <li className="flex items-start">
              <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
              Receive advance notification and arrange delivery
            </li>
          </ol>
        </div>
      </div>
      <Cart />
      <Footer />
    </div>
  );
};

export default DeliveryRestriction;
