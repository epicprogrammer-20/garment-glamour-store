
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload, LogOut } from 'lucide-react';
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

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
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

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const initData = async () => {
        await Promise.all([fetchProducts(), fetchVideos(), createSampleData()]);
      };
      initData();
    }
  }, [isAuthenticated]);

  const createSampleData = async () => {
    try {
      // Check if sample products already exist
      const { data: existingProducts } = await supabase
        .from('products')
        .select('name')
        .in('name', ['Men\'s Classic T-Shirt']);

      if (existingProducts && existingProducts.length === 0) {
        // Create sample men's product for the homepage
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
          // Create sale entry for the product
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2" size={16} />
            Logout
          </Button>
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

        {/* Videos List */}
        <div className="bg-white rounded-lg shadow p-6">
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
      </div>
    </div>
  );
};

export default Admin;
