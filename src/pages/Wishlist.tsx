
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>
            <p className="text-gray-600">Please login to view your wishlist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-gray-600">
            {products.length > 0 
              ? `You have ${products.length} item${products.length !== 1 ? 's' : ''} in your wishlist.`
              : 'Your wishlist is empty. Start adding products you love!'
            }
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
            <p className="text-gray-400 mt-2">Browse our products and add some favorites!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
