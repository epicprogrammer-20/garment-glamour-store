
import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const { dispatch } = useCart();
  
  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, size: selectedSize }
    });
  };
  
  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart
            size={16}
            className={isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}
          />
        </button>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-gray-900 mb-4">${product.price}</p>
        
        {/* Size selector */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Size:</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                  selectedSize === size
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
