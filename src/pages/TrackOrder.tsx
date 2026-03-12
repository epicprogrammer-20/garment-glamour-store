
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Search, Package, CheckCircle2, Truck, MapPin } from 'lucide-react';

interface OrderData {
  id: string;
  tracking_code: string;
  status: string | null;
  created_at: string | null;
  total: number;
  estimated_delivery: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  size: string | null;
  quantity: number;
  price: number;
}

const STEPS = ['placed', 'processing', 'shipped', 'delivered'] as const;

const stepLabels: Record<string, string> = {
  placed: 'Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const stepIcons: Record<string, React.ReactNode> = {
  placed: <Package size={20} />,
  processing: <CheckCircle2 size={20} />,
  shipped: <Truck size={20} />,
  delivered: <MapPin size={20} />,
};

const TrackOrder = () => {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setItems([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lookup-order', {
        body: { tracking_code: code.trim().toUpperCase() },
      });

      if (fnError || !data?.order) {
        setError('No order found with that tracking code.');
        setLoading(false);
        return;
      }

      setOrder(data.order as OrderData);
      if (data.items) setItems(data.items as OrderItem[]);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const currentStatus = order?.status || 'pending';
  const mappedStatus = currentStatus === 'pending' ? 'placed' : currentStatus;
  const activeIndex = STEPS.indexOf(mappedStatus as typeof STEPS[number]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Track Your Order</h1>
        <p className="text-center text-muted-foreground mb-8">Enter your 5-digit tracking code to see your order status</p>

        <div className="flex gap-2 mb-8">
          <Input
            placeholder="Enter tracking code (e.g. A1B2C)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={5}
            className="text-center text-lg tracking-widest font-mono"
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
          />
          <Button onClick={handleTrack} disabled={loading}>
            <Search size={16} className="mr-1" /> Track
          </Button>
        </div>

        {error && <p className="text-center text-destructive mb-4">{error}</p>}

        {order && (
          <Card className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Order Code</p>
                <p className="text-xl font-bold font-mono">{order.tracking_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date Placed</p>
                <p className="font-semibold">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="py-6">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-muted rounded-full" />
                <div
                  className="absolute top-5 left-[10%] h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, activeIndex) * (80 / (STEPS.length - 1))}%` }}
                />

                {STEPS.map((step, i) => {
                  const isActive = i <= activeIndex;
                  return (
                    <div key={step} className="flex flex-col items-center z-10 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-background border-muted-foreground/30 text-muted-foreground'
                      }`}>
                        {isActive ? <CheckCircle2 size={20} /> : stepIcons[step]}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {stepLabels[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="font-semibold text-lg capitalize">
                {mappedStatus === 'delivered'
                  ? 'Your order has been delivered'
                  : mappedStatus === 'shipped'
                  ? 'Your order is on the way'
                  : mappedStatus === 'processing'
                  ? 'Your order is being processed'
                  : 'Your order has been placed'}
              </p>
              {order.estimated_delivery && mappedStatus !== 'delivered' && (
                <p className="text-sm text-muted-foreground">
                  Estimated delivery: <span className="font-semibold text-foreground">
                    {new Date(order.estimated_delivery).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
              )}
              {!order.estimated_delivery && mappedStatus !== 'delivered' && order.created_at && (
                <p className="text-sm text-muted-foreground">
                  Estimated delivery: <span className="font-semibold text-foreground">
                    {new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
              )}
              {mappedStatus === 'delivered' && (
                <a href="/refund" className="inline-block mt-2 text-sm text-primary underline hover:no-underline">
                  Need a refund? Request one here
                </a>
              )}
            </div>

            {/* Order Items */}
            {items.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Items in this order</h3>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                    {item.product_image && (
                      <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.size || 'N/A'} · Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-sm pt-4 border-t border-border">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-lg">${Number(order.total).toFixed(2)}</span>
            </div>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
