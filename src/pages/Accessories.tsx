
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';

const Accessories = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Accessories Collection</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Complete your look with our curated selection of premium accessories. 
            The perfect finishing touch for any outfit.
          </p>
        </div>
      </section>

      <ProductGrid category="accessories" />
      
      <Footer />
    </div>
  );
};

export default Accessories;
