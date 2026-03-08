
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();

  const scrollToGallery = () => {
    const el = document.getElementById('style-gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Elevate Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Style
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-md">
              Discover our curated collection of premium fashion pieces that define modern elegance.
            </p>
            <div className="flex space-x-4">
              <button className="bg-white text-black px-8 py-3 font-semibold hover:bg-gray-100 transition-colors">
                Shop Women
              </button>
              <button className="border border-white text-white px-8 py-3 font-semibold hover:bg-white hover:text-black transition-colors">
                Shop Men
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-white rounded-lg p-6 text-black">
                <h3 className="text-2xl font-bold mb-2">Featured Collection</h3>
                <p className="text-gray-600 mb-4">Spring/Summer 2024</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">40% OFF</span>
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
