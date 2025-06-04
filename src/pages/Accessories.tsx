
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';

const Accessories = () => {
  const accessoryProducts = products.filter(product => product.category === 'accessories');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Accessories Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete your look with our curated selection of premium accessories and statement pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {accessoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {accessoryProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No accessories available at the moment.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Accessories;
