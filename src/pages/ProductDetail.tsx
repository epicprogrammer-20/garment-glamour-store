
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ProductComments } from '@/components/ProductComments';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  description?: string;
  originalPrice?: number;
  discountPercentage?: number;
  isOnSale?: boolean;
  is_out_of_stock?: boolean;
  shipping_cost?: number;
  duty_fee?: number;
  tax_rate?: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data: productData, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', parseInt(id))
          .single();

        if (error) { navigate('/'); return; }

        const { data: saleData } = await supabase
          .from('sale_products')
          .select('*')
          .eq('product_id', parseInt(id))
          .eq('is_active', true)
          .single();

        if (saleData) {
          setProduct({ ...productData, originalPrice: saleData.original_price, price: saleData.sale_price, discountPercentage: saleData.discount_percentage, isOnSale: true });
        } else {
          setProduct({ ...productData, isOnSale: false });
        }
      } catch { navigate('/'); } finally { setLoading(false); }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center min-h-[60vh]"><div>Loading...</div></div><Footer /></div>;
  if (!product) return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center min-h-[60vh]"><div>Product not found</div></div><Footer /></div>;

  const handleAddToCart = () => {
    if (product.is_out_of_stock) {
      toast({ title: "Out of Stock", description: "This product is currently unavailable and cannot be added to cart.", variant: "destructive" });
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, size: selectedSize || 'One Size', quantity } });
    toast({ title: "Added to cart", description: `${quantity}x ${product.name} added to your cart.` });
    setQuantity(1);
  };

  const taxAmount = product.tax_rate ? (product.price * product.tax_rate / 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${product.is_out_of_stock ? 'opacity-60' : ''}`} />
            {product.is_out_of_stock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full text-lg font-bold">Out of Stock</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <div className="mt-2">
                {product.isOnSale && product.originalPrice ? (
                  <div className="flex items-center space-x-3">
                    <p className="text-3xl font-bold text-destructive">{formatPrice(product.price)}</p>
                    <p className="text-2xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                    {product.discountPercentage && <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-sm font-bold">{product.discountPercentage}% OFF</span>}
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</p>
                )}
              </div>
              <div className="flex items-center mt-2">
                <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-current" />)}</div>
                <span className="ml-2 text-muted-foreground">(4.8)</span>
              </div>
            </div>

            {product.is_out_of_stock && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive font-medium">This product is currently out of stock and cannot be added to cart.</p>
              </div>
            )}

            {product.description && (
              <div><h3 className="text-lg font-semibold mb-2">Description</h3><p className="text-muted-foreground">{product.description}</p></div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-md transition-colors ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-muted-foreground'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted">-</button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted">+</button>
              </div>
            </div>

            {/* Fees breakdown */}
            {(product.shipping_cost || product.duty_fee || product.tax_rate) ? (
              <div className="border-t pt-4 space-y-1 text-sm">
                <h3 className="text-lg font-semibold mb-2">Estimated Fees</h3>
                {product.shipping_cost ? <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatPrice(product.shipping_cost)}</span></div> : null}
                {product.duty_fee ? <div className="flex justify-between text-muted-foreground"><span>Duty Fee</span><span>{formatPrice(product.duty_fee)}</span></div> : null}
                {product.tax_rate ? <div className="flex justify-between text-muted-foreground"><span>Tax ({product.tax_rate}%)</span><span>{formatPrice(taxAmount)}</span></div> : null}
              </div>
            ) : null}

            <div className="flex space-x-4">
              <Button onClick={handleAddToCart} className="flex-1" disabled={product.is_out_of_stock}>
                <ShoppingCart className="mr-2" size={20} />
                {product.is_out_of_stock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" onClick={() => toggleWishlist(product.id)} className={isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}>
                <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Product Details</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Category: {product.category}</li>
                <li>• Material: Premium quality fabric</li>
                <li>• Care: Machine wash cold</li>
                <li>• Fit: Regular fit</li>
              </ul>
            </div>
          </div>
        </div>

        <ProductComments productId={product.id} />
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
