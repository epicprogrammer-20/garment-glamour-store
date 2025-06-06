
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';

const Men = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Men's Collection</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Sharp, sophisticated styles for the discerning gentleman. 
            Premium quality pieces that make a statement.
          </p>
        </div>
      </section>

      <ProductGrid category="men" />
      
      <Footer />
    </div>
  );
};

export default Men;
