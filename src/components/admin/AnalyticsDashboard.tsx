
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DollarSign, Eye, RotateCcw, Package, TrendingUp, TrendingDown } from 'lucide-react';

interface OrderWithDetails {
  id: string;
  total: number;
  status: string | null;
  created_at: string | null;
  payment_method: string | null;
  country: string | null;
  customer_email: string | null;
  customer_name: string | null;
}

interface ChartDataPoint {
  date: string;
  sales: number;
  refunds: number;
  profit: number;
}

const AnalyticsDashboard = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [totalProductValue, setTotalProductValue] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      await Promise.all([
        fetchSalesData(),
        fetchVisits(),
        fetchRefunds(),
        fetchProducts(),
        fetchOrders(),
        fetchChartData(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    const { data } = await supabase.from('orders').select('total');
    if (data) {
      setTotalSales(data.reduce((sum, o) => sum + Number(o.total), 0));
    }
  };

  const fetchVisits = async () => {
    const { count } = await supabase.from('site_visits').select('*', { count: 'exact', head: true });
    setTotalVisits(count || 0);
  };

  const fetchRefunds = async () => {
    const { data } = await supabase.from('refunds').select('amount');
    if (data) {
      setTotalRefunds(data.reduce((sum, r) => sum + Number(r.amount), 0));
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('price');
    if (data) {
      setActiveProducts(data.length);
      setTotalProductValue(data.reduce((sum, p) => sum + Number(p.price), 0));
    }
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      setOrders(data as OrderWithDetails[]);
    }
  };

  const fetchChartData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ordersRes, refundsRes] = await Promise.all([
      supabase.from('orders').select('total, created_at').gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('refunds').select('amount, created_at').gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    const salesByDate: Record<string, number> = {};
    const refundsByDate: Record<string, number> = {};

    ordersRes.data?.forEach((o) => {
      const date = new Date(o.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesByDate[date] = (salesByDate[date] || 0) + Number(o.total);
    });

    refundsRes.data?.forEach((r) => {
      const date = new Date(r.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      refundsByDate[date] = (refundsByDate[date] || 0) + Number(r.amount);
    });

    const allDates = new Set([...Object.keys(salesByDate), ...Object.keys(refundsByDate)]);
    const chart: ChartDataPoint[] = Array.from(allDates)
      .map((date) => ({
        date,
        sales: salesByDate[date] || 0,
        refunds: refundsByDate[date] || 0,
        profit: (salesByDate[date] || 0) - (refundsByDate[date] || 0),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(chart);
  };

  const chartConfig = {
    sales: { label: 'Sales', color: '#22c55e' },
    refunds: { label: 'Refunds', color: '#ef4444' },
    profit: { label: 'Profit', color: '#3b82f6' },
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Website Visits</p>
              <p className="text-2xl font-bold text-blue-600">{totalVisits.toLocaleString()}</p>
            </div>
            <Eye className="text-blue-600" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Refunds</p>
              <p className="text-2xl font-bold text-red-600">${totalRefunds.toFixed(2)}</p>
            </div>
            <RotateCcw className="text-red-600" size={32} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Products ({activeProducts})</p>
              <p className="text-2xl font-bold text-purple-600">${totalProductValue.toFixed(2)}</p>
            </div>
            <Package className="text-purple-600" size={32} />
          </div>
        </Card>
      </div>

      {/* Profit/Loss Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} /> Profit & Loss (Last 30 Days)
        </h3>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No data available yet. Sales data will appear here.</p>
        )}
      </Card>

      {/* Orders Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🛒 Recent Orders</h3>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customer_name || 'N/A'}</TableCell>
                    <TableCell>{order.customer_email || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                        {order.payment_method?.replace('-', ' ') || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{order.country || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No orders yet.</p>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
