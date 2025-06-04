
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

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
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [isLiking, setIsLiking] = useState(false);
  const { dispatch } = useCart();
  const { dispatch: wishlistDispatch, isInWishlist } = useWishlist();
  
  const isLiked = isInWishlist(product.id);
  
  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, size: selectedSize }
    });
  };
  
  const handleToggleWishlist = () => {
    setIsLiking(true);
    setTimeout(() => {
      if (isLiked) {
        wishlistDispatch({ type: 'REMOVE_ITEM', payload: product.id });
      } else {
        wishlistDispatch({ type: 'ADD_ITEM', payload: product });
      }
      setIsLiking(false);
    }, 200);
  };
  
  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:scale-105">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 ${
            isLiking ? 'animate-pulse scale-125' : ''
          }`}
        >
          <Heart
            size={16}
            className={`transition-all duration-300 ${
              isLiked 
                ? 'text-red-500 fill-current scale-110' 
                : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-2xl font-bold text-gray-900 mb-4">${product.price}</p>
        
        {/* Size selector */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Size:</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 text-sm border rounded-md transition-all duration-200 ${
                  selectedSize === size
                    ? 'border-black bg-black text-white transform scale-105'
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
        >
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
