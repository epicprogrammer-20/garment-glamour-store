
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload, LogOut, Home, Image } from 'lucide-react';
import AdminAuth from '@/components/AdminAuth';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  description?: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
  is_active: boolean;
}

interface SaleProduct {
  id: string;
  product_id: number;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  is_active: boolean;
}

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  description?: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    imageFile: null as File | null,
    category: 'women',
    sizes: '',
    description: '',
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    description: '',
  });

  const [newSaleProduct, setNewSaleProduct] = useState({
    product_id: '',
    original_price: '',
    sale_price: '',
  });

  const [newGalleryImage, setNewGalleryImage] = useState({
    title: '',
    url: '',
    imageFile: null as File | null,
    description: '',
  });

  useEffect(() => {
    setIsAuthenticated(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const initData = async () => {
        await Promise.all([fetchProducts(), fetchVideos(), fetchSaleProducts(), fetchGalleryImages(), createSampleData()]);
      };
      initData();
    }
  }, [isAuthenticated]);

  const createSampleData = async () => {
    try {
      const { data: existingProducts } = await supabase
        .from('products')
        .select('name')
        .in('name', ['Men\'s Classic T-Shirt']);

      if (existingProducts && existingProducts.length === 0) {
        const { data: sampleProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            name: 'Men\'s Classic T-Shirt',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
            category: 'men',
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'A comfortable classic t-shirt perfect for everyday wear.',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating sample product:', insertError);
        } else if (sampleProduct) {
          const { error: saleError } = await supabase
            .from('sale_products')
            .insert({
              product_id: sampleProduct.id,
              original_price: 49.99,
              sale_price: 29.99,
              discount_percentage: 40,
              is_active: true,
            });

          if (saleError) {
            console.error('Error creating sale entry:', saleError);
          }

          toast({
            title: "Sample Data Created",
            description: "Sample men's product has been added for testing.",
          });
        }
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchSaleProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('sale_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSaleProducts(data || []);
    } catch (error) {
      console.error('Error fetching sale products:', error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      // Since we don't have a gallery table yet, we'll create a placeholder
      setGalleryImages([]);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    if (!newProduct.image && !newProduct.imageFile) {
      toast({
        title: "Error",
        description: "Please provide an image URL or upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = newProduct.image;

      if (newProduct.imageFile) {
        const fileExt = newProduct.imageFile.name.split('.').pop();
        const filePath = `products/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newProduct.imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        imageUrl = supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl;
      }

      const sizesArray = newProduct.sizes
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error: insertError } = await supabase.from('products').insert({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        image: imageUrl,
        category: newProduct.category,
        sizes: sizesArray,
        description: newProduct.description,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      setNewProduct({
        name: '',
        price: '',
        image: '',
        imageFile: null,
        category: 'women',
        sizes: '',
        description: '',
      });

      fetchProducts();
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add product: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newVideo.title || !newVideo.url) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from('videos').insert({
        title: newVideo.title,
        url: newVideo.url,
        description: newVideo.description,
        is_active: true,
      });

      if (error) throw error;

      setNewVideo({
        title: '',
        url: '',
        description: '',
      });

      fetchVideos();
      toast({
        title: "Success",
        description: "Video added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add video: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddSaleProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSaleProduct.product_id || !newSaleProduct.original_price || !newSaleProduct.sale_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const originalPrice = parseFloat(newSaleProduct.original_price);
      const salePrice = parseFloat(newSaleProduct.sale_price);
      const discountPercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

      const { error } = await supabase.from('sale_products').insert({
        product_id: parseInt(newSaleProduct.product_id),
        original_price: originalPrice,
        sale_price: salePrice,
        discount_percentage: discountPercentage,
        is_active: true,
      });

      if (error) throw error;

      setNewSaleProduct({
        product_id: '',
        original_price: '',
        sale_price: '',
      });

      fetchSaleProducts();
      toast({
        title: "Success",
        description: "Sale product added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add sale product: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newGalleryImage.title || (!newGalleryImage.url && !newGalleryImage.imageFile)) {
      toast({
        title: "Error",
        description: "Please fill in required fields and provide an image",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = newGalleryImage.url;

      if (newGalleryImage.imageFile) {
        const fileExt = newGalleryImage.imageFile.name.split('.').pop();
        const filePath = `gallery/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newGalleryImage.imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        imageUrl = supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl;
      }

      // For now, we'll store gallery images in a local state since we don't have a gallery table
      const newImage = {
        id: Date.now().toString(),
        title: newGalleryImage.title,
        url: imageUrl,
        description: newGalleryImage.description,
      };

      setGalleryImages(prev => [...prev, newImage]);

      setNewGalleryImage({
        title: '',
        url: '',
        imageFile: null,
        description: '',
      });

      toast({
        title: "Success",
        description: "Gallery image added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add gallery image: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchProducts();
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchVideos();
      toast({
        title: "Success",
        description: "Video deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete video: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteSaleProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sale_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchSaleProducts();
      toast({
        title: "Success",
        description: "Sale product deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete sale product: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline"
            className="mb-4"
          >
            <Home className="mr-2" size={16} />
            Back to Home
          </Button>
        </div>
        <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
            >
              <Home className="mr-2" size={16} />
              Back to Home
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </div>

        {/* Add Product Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" size={20} />
            Add New Product
          </h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="Enter price"
                required
              />
            </div>
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor="image-file">Or Upload Image File</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewProduct((prev) => ({
                      ...prev,
                      imageFile: file,
                    }));
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div>
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input
                id="sizes"
                value={newProduct.sizes}
                onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                placeholder="S, M, L, XL"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                Add Product
              </Button>
            </div>
          </form>
        </div>

        {/* Add Sale Product Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" size={20} />
            Add Product to Sale
          </h2>
          <form onSubmit={handleAddSaleProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sale-product">Select Product *</Label>
              <select
                id="sale-product"
                value={newSaleProduct.product_id}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="original-price">Original Price *</Label>
              <Input
                id="original-price"
                type="number"
                step="0.01"
                value={newSaleProduct.original_price}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, original_price: e.target.value })}
                placeholder="Original price"
                required
              />
            </div>
            <div>
              <Label htmlFor="sale-price">Sale Price *</Label>
              <Input
                id="sale-price"
                type="number"
                step="0.01"
                value={newSaleProduct.sale_price}
                onChange={(e) => setNewSaleProduct({ ...newSaleProduct, sale_price: e.target.value })}
                placeholder="Sale price"
                required
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" className="w-full">
                Add to Sale
              </Button>
            </div>
          </form>
        </div>

        {/* Add Video Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" size={20} />
            Add New Video
          </h2>
          <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video-title">Video Title *</Label>
              <Input
                id="video-title"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="Enter video title"
                required
              />
            </div>
            <div>
              <Label htmlFor="video-url">Video URL *</Label>
              <Input
                id="video-url"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                placeholder="Enter video URL"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                placeholder="Enter video description"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                Add Video
              </Button>
            </div>
          </form>
        </div>

        {/* Add Gallery Image Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Image className="mr-2" size={20} />
            Add Gallery Image
          </h2>
          <form onSubmit={handleAddGalleryImage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gallery-title">Image Title *</Label>
              <Input
                id="gallery-title"
                value={newGalleryImage.title}
                onChange={(e) => setNewGalleryImage({ ...newGalleryImage, title: e.target.value })}
                placeholder="Enter image title"
                required
              />
            </div>
            <div>
              <Label htmlFor="gallery-url">Image URL</Label>
              <Input
                id="gallery-url"
                value={newGalleryImage.url}
                onChange={(e) => setNewGalleryImage({ ...newGalleryImage, url: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label htmlFor="gallery-file">Or Upload Image File</Label>
              <Input
                id="gallery-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewGalleryImage((prev) => ({
                      ...prev,
                      imageFile: file,
                    }));
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="gallery-description">Description</Label>
              <Textarea
                id="gallery-description"
                value={newGalleryImage.description}
                onChange={(e) => setNewGalleryImage({ ...newGalleryImage, description: e.target.value })}
                placeholder="Enter image description"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                Add Gallery Image
              </Button>
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Image</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Price</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Sizes</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-2">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="py-2">{product.name}</td>
                    <td className="py-2">${product.price}</td>
                    <td className="py-2 capitalize">{product.category}</td>
                    <td className="py-2">{product.sizes.join(', ')}</td>
                    <td className="py-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sale Products List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sale Products ({saleProducts.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product ID</th>
                  <th className="text-left py-2">Original Price</th>
                  <th className="text-left py-2">Sale Price</th>
                  <th className="text-left py-2">Discount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {saleProducts.map((saleProduct) => (
                  <tr key={saleProduct.id} className="border-b">
                    <td className="py-2">{saleProduct.product_id}</td>
                    <td className="py-2">${saleProduct.original_price}</td>
                    <td className="py-2">${saleProduct.sale_price}</td>
                    <td className="py-2">{saleProduct.discount_percentage}%</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${saleProduct.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {saleProduct.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteSaleProduct(saleProduct.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Videos ({videos.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">URL</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b">
                    <td className="py-2">{video.title}</td>
                    <td className="py-2">
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {video.url.substring(0, 50)}...
                      </a>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${video.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {video.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteVideo(video.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gallery Images List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Gallery Images ({galleryImages.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4">
                <img src={image.url} alt={image.title} className="w-full h-32 object-cover rounded mb-2" />
                <h3 className="font-semibold">{image.title}</h3>
                <p className="text-sm text-gray-600">{image.description}</p>
                <Button size="sm" variant="destructive" className="mt-2 w-full">
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
