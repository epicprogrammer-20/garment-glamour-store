
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Home, BarChart3, ShoppingBag, Package, Tag, Image, Settings } from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';
import { AddProductForm } from '@/components/admin/AddProductForm';
import { AddSaleProductForm } from '@/components/admin/AddSaleProductForm';
import { AddVideoForm } from '@/components/admin/AddVideoForm';
import { AddGalleryImageForm } from '@/components/admin/AddGalleryImageForm';
import { ProductsList } from '@/components/admin/ProductsList';
import { SaleProductsList } from '@/components/admin/SaleProductsList';
import { VideosList } from '@/components/admin/VideosList';
import { GalleryImagesList } from '@/components/admin/GalleryImagesList';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PromoBannerManager from '@/components/admin/PromoBannerManager';
import EventManager from '@/components/admin/EventManager';
import CurrencyRatesManager from '@/components/admin/CurrencyRatesManager';
import StockManager from '@/components/admin/StockManager';
import OrdersHistory from '@/components/admin/OrdersHistory';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import RefundManager from '@/components/admin/RefundManager';

interface Product { id: number; name: string; price: number; image: string; category: string; sizes: string[]; description?: string; }
interface Video { id: string; title: string; url: string; description?: string; is_active: boolean; }
interface SaleProduct { id: string; product_id: number; original_price: number; sale_price: number; discount_percentage: number; is_active: boolean; }
interface GalleryImage { id: string; title: string; url: string; description?: string; }

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setIsAuthenticated(false); setLoading(false); }, []);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([fetchProducts(), fetchVideos(), fetchSaleProducts(), fetchGalleryImages()]);
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => { const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }); if (data) setProducts(data || []); };
  const fetchVideos = async () => { const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false }); if (data) setVideos(data || []); };
  const fetchSaleProducts = async () => { const { data } = await supabase.from('sale_products').select('*').order('created_at', { ascending: false }); if (data) setSaleProducts(data || []); };
  const fetchGalleryImages = async () => { const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false }); if (data) setGalleryImages(data || []); };

  const handleLogout = () => { localStorage.removeItem('adminAuthenticated'); setIsAuthenticated(false); };

  const deleteProduct = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { fetchProducts(); toast({ title: "Success", description: "Product deleted!" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (!error) { fetchVideos(); toast({ title: "Success", description: "Video deleted!" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const deleteSaleProduct = async (id: string) => {
    const { error } = await supabase.from('sale_products').delete().eq('id', id);
    if (!error) { fetchSaleProducts(); toast({ title: "Success", description: "Sale product deleted!" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleImageAdded = (image: GalleryImage) => { setGalleryImages(prev => [image, ...prev]); };

  const handleDeleteImage = async (id: string) => {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (!error) { setGalleryImages(prev => prev.filter(img => img.id !== id)); toast({ title: "Success", description: "Gallery image deleted!" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="p-4">
          <Button onClick={() => window.location.href = '/'} variant="outline" className="mb-4"><Home className="mr-2" size={16} /> Back to Home</Button>
        </div>
        <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = '/'} variant="outline" size="sm"><Home className="mr-1" size={14} /> Home</Button>
            <Button onClick={handleLogout} variant="outline" size="sm"><LogOut className="mr-1" size={14} /> Logout</Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-background p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs sm:text-sm">
              <BarChart3 size={14} /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1 text-xs sm:text-sm">
              <ShoppingBag size={14} /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 text-xs sm:text-sm">
              <Package size={14} /> Products
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-1 text-xs sm:text-sm">
              <Tag size={14} /> Sales
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1 text-xs sm:text-sm">
              <Image size={14} /> Media
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs sm:text-sm">
              <Settings size={14} /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderStatusManager />
            <OrdersHistory />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <AddProductForm onProductAdded={fetchProducts} />
            <StockManager />
            <ProductsList products={products} onDeleteProduct={deleteProduct} />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <AddSaleProductForm products={products} onSaleProductAdded={fetchSaleProducts} />
            <SaleProductsList saleProducts={saleProducts} onDeleteSaleProduct={deleteSaleProduct} />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <AddVideoForm onVideoAdded={fetchVideos} />
            <AddGalleryImageForm onImageAdded={handleImageAdded} />
            <VideosList videos={videos} onDeleteVideo={deleteVideo} />
            <GalleryImagesList galleryImages={galleryImages} onDeleteImage={handleDeleteImage} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PromoBannerManager />
            <EventManager />
            <CurrencyRatesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
