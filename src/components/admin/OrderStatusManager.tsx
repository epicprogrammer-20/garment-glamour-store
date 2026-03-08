
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  tracking_code: string | null;
  customer_name: string | null;
  customer_email: string | null;
  total: number;
  status: string | null;
  created_at: string | null;
}

const STATUSES = ['placed', 'processing', 'shipped', 'delivered'] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
};

const OrderStatusManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, tracking_code, customer_name, customer_email, total, status, created_at')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('order-status-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const updateData: any = { status: newStatus };
    
    // Set estimated delivery when moving to processing (7 days from now)
    if (newStatus === 'processing') {
      updateData.estimated_delivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: 'Updated', description: `Order status set to ${newStatus}` });
      
      // Send delivery email notification
      if (newStatus === 'delivered' && order?.customer_email) {
        try {
          await supabase.functions.invoke('send-delivery-email', {
            body: {
              email: order.customer_email,
              customerName: order.customer_name || 'Customer',
              trackingCode: order.tracking_code || '',
            },
          });
        } catch (e) {
          console.error('Failed to send delivery email:', e);
        }
      }
    }
  };

  const filtered = orders.filter(o => {
    const t = search.toLowerCase();
    if (!t) return true;
    return (
      (o.tracking_code || '').toLowerCase().includes(t) ||
      (o.customer_name || '').toLowerCase().includes(t) ||
      (o.customer_email || '').toLowerCase().includes(t)
    );
  });

  if (loading) return <div className="text-center py-8">Loading orders...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold">Order Status Management</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Search by code, name, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}><RefreshCw size={14} /></Button>
        </div>
      </div>

      <Card className="p-2 sm:p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(order => {
                const current = order.status === 'pending' ? 'placed' : (order.status || 'placed');
                return (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono font-bold">{order.tracking_code || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.customer_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[current] || statusColors.pending} text-xs capitalize`}>
                        {current}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {STATUSES.map(s => (
                          <Button
                            key={s}
                            size="sm"
                            variant={current === s ? 'default' : 'outline'}
                            className={`text-xs h-7 px-2 capitalize ${current === s ? '' : ''}`}
                            onClick={() => updateStatus(order.id, s)}
                            disabled={current === s}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default OrderStatusManager;
