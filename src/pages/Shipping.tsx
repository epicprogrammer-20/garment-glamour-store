
import React from 'react';
import { Header } from '../components/Header';
import { SecondaryNavbar } from '../components/SecondaryNavbar';
import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { Truck, Clock, Shield, Globe } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-white">
      <SecondaryNavbar />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about our shipping options, delivery times, and policies to ensure your order reaches you safely.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Shipping Options</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex items-center mb-3">
                  <Truck className="text-purple-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold">Standard Shipping</h3>
                </div>
                <p className="text-gray-600 mb-2">5-7 business days</p>
                <p className="font-semibold text-lg">Free on orders over $75</p>
                <p className="text-sm text-gray-500">$5.99 for orders under $75</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex items-center mb-3">
                  <Clock className="text-purple-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold">Express Shipping</h3>
                </div>
                <p className="text-gray-600 mb-2">2-3 business days</p>
                <p className="font-semibold text-lg">$12.99</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex items-center mb-3">
                  <Shield className="text-purple-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold">Overnight Shipping</h3>
                </div>
                <p className="text-gray-600 mb-2">Next business day</p>
                <p className="font-semibold text-lg">$24.99</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Delivery Areas</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Globe className="text-purple-600 mr-3" size={24} />
                <h3 className="text-xl font-semibold">Available Locations</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">United States</h4>
                  <p className="text-gray-600">All 50 states and territories</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Canada</h4>
                  <p className="text-gray-600">All provinces and territories</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">United Kingdom</h4>
                  <p className="text-gray-600">England, Scotland, Wales, Northern Ireland</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">European Union</h4>
                  <p className="text-gray-600">All EU member countries</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Australia</h4>
                  <p className="text-gray-600">All states and territories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Special Delivery Notice</h3>
          <p className="text-yellow-700">
            If your location is not listed above, don't worry! We offer special orders through our WhatsApp service. 
            Your product will be delivered when our brand visits your town or location on specific dates. 
            You'll be notified days before arrival.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold mb-6">Shipping Policies</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Processing Time</h4>
              <p className="text-gray-600 mb-4">
                Orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed the next business day.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tracking</h4>
              <p className="text-gray-600 mb-4">
                You'll receive a tracking number via email once your order ships. Track your package through our website or the carrier's site.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Damaged Items</h4>
              <p className="text-gray-600 mb-4">
                If your item arrives damaged, please contact us within 48 hours of delivery for a replacement or refund.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Address Changes</h4>
              <p className="text-gray-600 mb-4">
                Address changes can only be made before the order ships. Contact customer service immediately if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Cart />
      <Footer />
    </div>
  );
};

export default Shipping;
