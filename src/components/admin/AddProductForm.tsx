
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddProductFormProps {
  onProductAdded: () => void;
}

export const AddProductForm = ({ onProductAdded }: AddProductFormProps) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    imageFile: null as File | null,
    category: 'women',
    sizes: '',
    description: '',
  });

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

      onProductAdded();
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

  return (
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
  );
};
