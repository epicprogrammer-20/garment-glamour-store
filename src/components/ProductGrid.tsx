
import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { useSearch } from '../contexts/SearchContext';
import { supabase } from '@/integrations/supabase/client';

interface ProductGridProps {
  category?: string;
}

export const ProductGrid = ({ category }: ProductGridProps) => {
  const [filter, setFilter] = useState(category || 'all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (category) {
      setFilter(category);
    }
  }, [category]);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  let filteredProducts = filter === 'all' 
    ? products 
    : products.filter(product => product.category === filter);

  // Apply search filter if there's a search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (loading) {
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : 
             'Featured Products'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {searchQuery 
              ? `Found ${filteredProducts.length} products matching your search.`
              : category
              ? `Discover our premium ${category} collection, crafted with attention to detail and designed for the modern lifestyle.`
              : 'Discover our handpicked selection of premium fashion pieces, crafted with attention to detail and designed for the modern lifestyle.'
            }
          </p>
        </div>
        
        {/* Filter buttons - only show if no specific category is set */}
        {!category && (
          <div className="flex justify-center mb-12">
            <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
              {['all', 'women', 'men', 'accessories'].map((categoryOption) => (
                <button
                  key={categoryOption}
                  onClick={() => setFilter(categoryOption)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors capitalize ${
                    filter === categoryOption
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {categoryOption}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found for your search.</p>
            <p className="text-gray-400 mt-2">Try searching with different keywords.</p>
          </div>
        )}

        {filteredProducts.length === 0 && !searchQuery && category && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No {category} products available yet.</p>
            <p className="text-gray-400 mt-2">Check back soon for new arrivals!</p>
          </div>
        )}
      </div>
    </section>
  );
};
