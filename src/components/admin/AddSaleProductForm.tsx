
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface AddSaleProductFormProps {
  products: Product[];
  onSaleProductAdded: () => void;
}

export const AddSaleProductForm = ({ products, onSaleProductAdded }: AddSaleProductFormProps) => {
  const [newSaleProduct, setNewSaleProduct] = useState({
    product_id: '',
    original_price: '',
    sale_price: '',
  });

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

      onSaleProductAdded();
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

  return (
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
  );
};
