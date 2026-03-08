import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  image: string;
  is_out_of_stock: boolean;
  shipping_cost: number;
  duty_fee: number;
  tax_rate: number;
}

const StockManager = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, image, is_out_of_stock, shipping_cost, duty_fee, tax_rate').order('name');
    if (data) setProducts(data as Product[]);
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleStock = async (id: number, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_out_of_stock: !current }).eq('id', id);
    if (!error) {
      toast({ title: !current ? 'Marked out of stock' : 'Marked in stock' });
      fetchProducts();
    }
  };

  const updateField = async (id: number, field: string, value: number) => {
    await supabase.from('products').update({ [field]: value }).eq('id', id);
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Package size={20} /> Stock, Shipping & Tax Manager</h2>
      <p className="text-sm text-muted-foreground mb-4">Toggle products out of stock and set shipping costs, duty fees, and tax rates.</p>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-3 border rounded-lg p-3">
            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Switch checked={p.is_out_of_stock} onCheckedChange={() => toggleStock(p.id, p.is_out_of_stock)} />
                <Label className={`text-xs ${p.is_out_of_stock ? 'text-destructive' : 'text-green-600'}`}>
                  {p.is_out_of_stock ? 'Out of Stock' : 'In Stock'}
                </Label>
              </div>
            </div>
            <div className="flex gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Shipping ($)</Label>
                <Input type="number" step="0.01" defaultValue={p.shipping_cost || 0} className="w-20 h-8 text-xs"
                  onBlur={e => updateField(p.id, 'shipping_cost', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Duty ($)</Label>
                <Input type="number" step="0.01" defaultValue={p.duty_fee || 0} className="w-20 h-8 text-xs"
                  onBlur={e => updateField(p.id, 'duty_fee', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Tax (%)</Label>
                <Input type="number" step="0.01" defaultValue={p.tax_rate || 0} className="w-20 h-8 text-xs"
                  onBlur={e => updateField(p.id, 'tax_rate', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StockManager;
