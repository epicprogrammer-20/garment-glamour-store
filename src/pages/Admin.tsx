import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Plus, Trash2, Upload, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { isAdminAuthenticated, adminLogin, adminLogout } = useAdminAuth();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', image: '', category: 'women', sizes: '', description: ''
  });
  const [newVideo, setNewVideo] = useState({
    title: '', url: '', description: ''
  });
  const [newSaleProduct, setNewSaleProduct] = useState({
    product_id: '', original_price: '', sale_price: '', discount_percentage: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchProducts();
      fetchVideos();
      fetchSaleProducts();
    }
  }, [isAdminAuthenticated]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      setProducts(data || []);
    } catch (error: any) {
      console.error('Fetch products error:', error);
      toast({
        title: "Error",
        description: `Failed to fetch products: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }
      setVideos(data || []);
    } catch (error: any) {
      console.error('Fetch videos error:', error);
      toast({
        title: "Error",
        description: `Failed to fetch videos: ${error.message}`,
        variant: "destructive",
      });
    }
  };

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
            category
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sale products:', error);
        throw error;
      }
      setSaleProducts(data || []);
    } catch (error: any) {
      console.error('Fetch sale products error:', error);
      toast({
        title: "Error",
        description: `Failed to fetch sale products: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    try {
      // Check if bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === bucket);
      
      if (!bucketExists) {
        const { error: bucketError } = await supabase.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: bucket === 'products' ? ['image/*'] : ['video/*'],
          fileSizeLimit: bucket === 'products' ? 5242880 : 52428800 // 5MB for images, 50MB for videos
        });
        
        if (bucketError) {
          console.error('Error creating bucket:', bucketError);
          throw bucketError;
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading file:', { bucket, filePath, fileSize: file.size, fileType: file.type });

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Starting image upload...');
      const imageUrl = await uploadFile(file, 'products');
      setNewProduct({ ...newProduct, image: imageUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Please select a valid video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Video size must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Starting video upload...');
      const videoUrl = await uploadFile(file, 'videos');
      setNewVideo({ ...newVideo, url: videoUrl });
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast({
        title: "Error",
        description: `Failed to upload video: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await adminLogin(loginForm.username, loginForm.password);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const sizesArray = newProduct.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const { error } = await supabase.from('products').insert({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        image: newProduct.image,
        category: newProduct.category,
        sizes: sizesArray,
        description: newProduct.description
      });

      if (error) {
        console.error('Product insert error:', error);
        throw error;
      }

      setNewProduct({ name: '', price: '', image: '', category: 'women', sizes: '', description: '' });
      fetchProducts();
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
    } catch (error: any) {
      console.error('Product add error:', error);
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
      const { error } = await supabase.from('videos').insert(newVideo);

      if (error) {
        console.error('Video insert error:', error);
        throw error;
      }

      setNewVideo({ title: '', url: '', description: '' });
      fetchVideos();
      toast({
        title: "Success",
        description: "Video added successfully!",
      });
    } catch (error: any) {
      console.error('Video add error:', error);
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
      const discountPercentage = newSaleProduct.discount_percentage || 
        Math.round((1 - parseFloat(newSaleProduct.sale_price) / parseFloat(newSaleProduct.original_price)) * 100);

      const { error } = await supabase.from('sale_products').insert({
        product_id: parseInt(newSaleProduct.product_id),
        original_price: parseFloat(newSaleProduct.original_price),
        sale_price: parseFloat(newSaleProduct.sale_price),
        discount_percentage: discountPercentage,
        is_active: true
      });

      if (error) {
        console.error('Sale product insert error:', error);
        throw error;
      }

      setNewSaleProduct({ product_id: '', original_price: '', sale_price: '', discount_percentage: '' });
      fetchSaleProducts();
      toast({
        title: "Success",
        description: "Sale product added successfully!",
      });
    } catch (error: any) {
      console.error('Sale product add error:', error);
      toast({
        title: "Error",
        description: `Failed to add sale product: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Error deleting product:', error);
          throw error;
        }
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
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        const { error } = await supabase.from('videos').delete().eq('id', id);
        if (error) {
          console.error('Error deleting video:', error);
          throw error;
        }
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
    }
  };

  const handleDeleteSaleProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product from sale?')) {
      try {
        const { error } = await supabase.from('sale_products').delete().eq('id', id);
        if (error) {
          console.error('Error deleting sale product:', error);
          throw error;
        }
        fetchSaleProducts();
        toast({
          title: "Success",
          description: "Sale product removed successfully!",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to remove sale product: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock size={24} />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login to Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={adminLogout} variant="destructive">
            Logout & Return to Site
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="sale">Sale Products</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="image">Product Image</Label>
                    <div className="space-y-2">
                      <Input
                        id="image"
                        placeholder="Image URL or upload file below"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          disabled={uploading}
                        >
                          <Upload size={16} className="mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
                      placeholder="XS, S, M, L, XL"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button type="submit" className="w-full">
                      <Plus size={16} className="mr-2" />
                      Add Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-gray-600">${product.price} - {product.category}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Video</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVideo} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">Video URL</Label>
                    <div className="space-y-2">
                      <Input
                        id="url"
                        placeholder="Video URL or upload file below"
                        value={newVideo.url}
                        onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          id="video-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('video-upload')?.click()}
                          disabled={uploading}
                        >
                          <Upload size={16} className="mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newVideo.description}
                      onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add Video
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{video.title}</h3>
                        <p className="text-gray-600">{video.description}</p>
                        <p className="text-sm text-blue-600">{video.url}</p>
                      </div>
                      <Button
                        onClick={() => handleDeleteVideo(video.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sale" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag size={20} />
                  Add Product to Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSaleProduct} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_id">Select Product</Label>
                    <select
                      id="product_id"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newSaleProduct.product_id}
                      onChange={(e) => setNewSaleProduct({ ...newSaleProduct, product_id: e.target.value })}
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
                    <Label htmlFor="original_price">Original Price</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={newSaleProduct.original_price}
                      onChange={(e) => setNewSaleProduct({ ...newSaleProduct, original_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sale_price">Sale Price</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      value={newSaleProduct.sale_price}
                      onChange={(e) => setNewSaleProduct({ ...newSaleProduct, sale_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_percentage">Discount % (auto-calculated)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      value={newSaleProduct.discount_percentage}
                      onChange={(e) => setNewSaleProduct({ ...newSaleProduct, discount_percentage: e.target.value })}
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button type="submit" className="w-full">
                      <Tag size={16} className="mr-2" />
                      Add to Sale
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products on Sale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {saleProducts.map((saleProduct) => (
                    <div key={saleProduct.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {saleProduct.products && (
                          <img 
                            src={saleProduct.products.image} 
                            alt={saleProduct.products.name} 
                            className="w-16 h-16 object-cover rounded" 
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{saleProduct.products?.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 line-through">${saleProduct.original_price}</span>
                            <span className="text-red-600 font-bold">${saleProduct.sale_price}</span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                              {saleProduct.discount_percentage}% OFF
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteSaleProduct(saleProduct.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
