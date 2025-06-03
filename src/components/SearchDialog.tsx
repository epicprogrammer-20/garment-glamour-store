
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { useSearch } from '../contexts/SearchContext';

export const SearchDialog = () => {
  const { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen } = useSearch();
  const [localQuery, setLocalQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(localQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(localQuery.toLowerCase())
  );

  const handleSearch = () => {
    setSearchQuery(localQuery);
    setIsSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center p-4 border-b">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search products..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="flex-1 outline-none text-lg"
            autoFocus
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {localQuery && (
            <div className="p-4">
              <h3 className="font-semibold mb-3">Search Results</h3>
              {filteredProducts.length > 0 ? (
                <div className="space-y-3">
                  {filteredProducts.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-gray-600">${product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
