
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, Timer, Flame } from 'lucide-react';

const Sale = () => {
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('sale_products')
        .select(`
          *,
          products (
            id,
            name,
            image,
            category,
            description,
            sizes
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sale products:', error);
        throw error;
      }

      // Transform the data to match ProductCard expectations
      const transformedProducts = (data || []).map(saleProduct => ({
        ...saleProduct.products,
        originalPrice: saleProduct.original_price,
        price: saleProduct.sale_price,
        discountPercentage: saleProduct.discount_percentage
      }));
      
      setSaleProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <p>Loading sale items...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Sale Banner */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Flame className="text-yellow-400 mr-3" size={48} />
            <h1 className="text-6xl font-bold">MEGA SALE</h1>
            <Flame className="text-yellow-400 ml-3" size={48} />
          </div>
          <p className="text-2xl mb-8">Up to 50% OFF on Selected Items!</p>
          <div className="bg-red-700 inline-block px-8 py-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <Timer size={24} />
              <span className="text-xl font-semibold">Limited Time Offer!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-8 rounded-xl text-center transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold mb-2">UP TO 50% OFF</h3>
              <p className="text-lg">All Designer Pieces</p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold mt-4 hover:bg-gray-100 transition-colors">
                SHOP NOW
              </button>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-pink-800 text-white p-8 rounded-xl text-center transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold mb-2">BUY 2 GET 1</h3>
              <p className="text-lg">Accessories Collection</p>
              <button className="bg-white text-pink-600 px-6 py-2 rounded-full font-semibold mt-4 hover:bg-gray-100 transition-colors">
                BUY NOW
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-8 rounded-xl text-center transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold mb-2">FREE SHIPPING</h3>
              <p className="text-lg">Orders Over $100</p>
              <button className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold mt-4 hover:bg-gray-100 transition-colors">
                SHOP FREE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="bg-black text-white py-8 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-3 rounded-full">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-400">FLASH SALE</h3>
                <p className="text-sm">Ends in 24 hours</p>
              </div>
            </div>
            <div className="hidden md:block h-12 w-px bg-gray-600"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">UP TO 50% OFF</p>
              <p className="text-sm">Everything Must Go!</p>
            </div>
            <div className="hidden md:block h-12 w-px bg-gray-600"></div>
            <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition-colors">
              SHOP THE SALE
            </button>
          </div>
        </div>
      </section>

      {/* Sale Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sale Items
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these incredible deals! Limited quantities available.
            </p>
          </div>

          {saleProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {saleProducts.map((product) => (
                <div key={product.id} className="relative">
                  {/* Sale Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discountPercentage}% OFF
                  </div>
                  {/* Original Price Display */}
                  <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    <span className="line-through">${product.originalPrice}</span>
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No sale items available at the moment.</p>
              <p className="text-gray-400 mt-2">Check back soon for amazing deals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Don't Miss Out!</h2>
          <p className="text-xl mb-8">Sale ends soon. Get your favorites before they're gone!</p>
          <button className="bg-white text-red-600 px-12 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition-colors transform hover:scale-105">
            SHOP SALE NOW
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sale;
