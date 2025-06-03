
import React, { useState } from 'react';
import { products } from '../data/products';
import { ProductCard } from './ProductCard';

export const ProductGrid = () => {
  const [filter, setFilter] = useState('all');
  
  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.category === filter);
  
  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium fashion pieces, crafted with attention to detail and designed for the modern lifestyle.
          </p>
        </div>
        
        {/* Filter buttons */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            {['all', 'women', 'men', 'accessories'].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-md font-medium transition-colors capitalize ${
                  filter === category
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
