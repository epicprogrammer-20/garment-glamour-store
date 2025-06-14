
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
}

interface ProductsListProps {
  products: Product[];
  onDeleteProduct: (id: number) => void;
}

export const ProductsList = ({ products, onDeleteProduct }: ProductsListProps) => {
  return (
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
                    <Button size="sm" variant="destructive" onClick={() => onDeleteProduct(product.id)}>
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
  );
};
