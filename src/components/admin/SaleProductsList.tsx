
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface SaleProduct {
  id: string;
  product_id: number;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  is_active: boolean;
}

interface SaleProductsListProps {
  saleProducts: SaleProduct[];
  onDeleteSaleProduct: (id: string) => void;
}

export const SaleProductsList = ({ saleProducts, onDeleteSaleProduct }: SaleProductsListProps) => {
  return (
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
                    <Button size="sm" variant="destructive" onClick={() => onDeleteSaleProduct(saleProduct.id)}>
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
