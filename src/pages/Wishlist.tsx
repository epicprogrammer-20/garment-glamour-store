
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Wishlist = () => {
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();

  const removeFromWishlist = (id: number) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const addToCart = (item: any) => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: { ...item, size: item.sizes[0] }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Wishlist</h1>
          <p className="text-gray-600">Keep track of items you love</p>
        </div>

        {wishlistState.items.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love to keep track of them</p>
            <Link
              to="/"
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistState.items.map((item) => (
              <div key={item.id} className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
                
                <Link to={`/product/${item.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-gray-900 mb-4">${item.price}</p>
                  
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
