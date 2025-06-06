
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';

const Women = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Women's Collection</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover elegant and sophisticated pieces designed for the modern woman. 
            From timeless classics to contemporary trends.
          </p>
        </div>
      </section>

      <ProductGrid category="women" />
      
      <Footer />
    </div>
  );
};

export default Women;
