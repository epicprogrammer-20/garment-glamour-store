
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, ShoppingBag, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    if (user && wishlistItems.length > 0) {
      fetchWishlistProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlistItems, user]);

  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlistItems);

      if (error) {
        console.error('Error fetching wishlist products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center animate-fade-in">
            <Heart className="w-24 h-24 mx-auto text-blue-600 mb-8 animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-blue-200 max-w-md mx-auto">
              <p className="text-gray-600 mb-6">Please login to view your wishlist and save your favorite items.</p>
              <Link 
                to="/profile" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
              >
                Login Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-blue-600 mr-3 animate-pulse" />
            <Heart className="w-12 h-12 text-blue-600 animate-pulse" />
            <Sparkles className="w-8 h-8 text-blue-600 ml-3 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-gray-600 text-lg">
            {products.length > 0 
              ? `You have ${products.length} favorite item${products.length !== 1 ? 's' : ''} saved.`
              : 'Your wishlist is empty. Start adding products you love!'
            }
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-blue-600 text-lg">Loading your favorites...</p>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white p-8 sm:p-12 rounded-lg shadow-lg border border-blue-200 max-w-md mx-auto animate-fade-in">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Discover amazing products and add them to your wishlist!</p>
              <div className="space-y-3">
                <Link 
                  to="/women" 
                  className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Shop Women
                </Link>
                <Link 
                  to="/men" 
                  className="flex items-center justify-center w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop Men
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
