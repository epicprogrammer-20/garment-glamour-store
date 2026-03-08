
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Search, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  size: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string | null;
  created_at: string | null;
  payment_method: string | null;
  country: string | null;
  customer_email: string | null;
  customer_name: string | null;
}

const OrdersHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (data) {
      setOrderItems(prev => ({ ...prev, [orderId]: data as OrderItem[] }));
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-history-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => [payload.new as Order, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const filtered = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (o.customer_name || '').toLowerCase().includes(term) ||
      (o.customer_email || '').toLowerCase().includes(term) ||
      (o.country || '').toLowerCase().includes(term) ||
      (o.payment_method || '').toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Customer', 'Email', 'Amount ($)', 'Payment Method', 'Country', 'Status', 'Date', 'Time'];
    const rows = filtered.map(o => {
      const d = o.created_at ? new Date(o.created_at) : null;
      return [
        o.customer_name || 'N/A',
        o.customer_email || 'N/A',
        Number(o.total).toFixed(2),
        o.payment_method?.replace('-', ' ') || 'N/A',
        o.country || 'N/A',
        o.status || 'pending',
        d ? d.toLocaleDateString() : 'N/A',
        d ? d.toLocaleTimeString() : 'N/A',
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { date: 'N/A', time: 'N/A' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag size={24} /> Orders & Sales History
          <span className="text-xs font-normal text-green-600 ml-1">● Live</span>
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by name, email, country..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filtered.length}>
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card className="p-2 sm:p-4">
        <div className="text-sm text-muted-foreground mb-3">
          Showing {filtered.length} of {orders.length} orders
        </div>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(order => {
                  const { date, time } = formatDate(order.created_at);
                  const isExpanded = expandedOrder === order.id;
                  const items = orderItems[order.id] || [];
                  return (
                    <React.Fragment key={order.id}>
                      <TableRow className="cursor-pointer hover:bg-muted/70" onClick={() => toggleExpand(order.id)}>
                        <TableCell className="p-2">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </TableCell>
                        <TableCell className="font-medium">{order.customer_name || 'N/A'}</TableCell>
                        <TableCell className="text-sm">{order.customer_email || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">${Number(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {order.payment_method?.replace('-', ' ') || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.country || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {order.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{date}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{time}</TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/30 p-4">
                            <h4 className="font-semibold mb-2 text-sm">Order Items</h4>
                            {items.length > 0 ? (
                              <div className="space-y-2">
                                {items.map(item => (
                                  <div key={item.id} className="flex items-center gap-3 bg-background rounded p-2">
                                    {item.product_image && (
                                      <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.product_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Size: {item.size || 'N/A'} · Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No item details available for this order.</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No orders found.</p>
        )}
      </Card>
    </div>
  );
};

export default OrdersHistory;
