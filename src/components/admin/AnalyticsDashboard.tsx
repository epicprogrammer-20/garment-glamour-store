
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, Eye, RotateCcw, Package, TrendingUp, CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Date range filter
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const from = dateFrom?.toISOString();
    const to = dateTo ? new Date(dateTo.getTime() + 86400000).toISOString() : undefined;

    try {
      await Promise.all([
        fetchSalesData(from, to),
        fetchVisits(from, to),
        fetchRefunds(from, to),
        fetchProducts(),
        fetchOrders(from, to),
        fetchChartData(from, to),
      ]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchSalesData = async (from?: string, to?: string) => {
    let query = supabase.from('orders').select('total');
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    const { data } = await query;
    if (data) setTotalSales(data.reduce((sum, o) => sum + Number(o.total), 0));
  };

  const fetchVisits = async (from?: string, to?: string) => {
    let query = supabase.from('site_visits').select('*', { count: 'exact', head: true });
    if (from) query = query.gte('visited_at', from);
    if (to) query = query.lte('visited_at', to);
    const { count } = await query;
    setTotalVisits(count || 0);
  };

  const fetchRefunds = async (from?: string, to?: string) => {
    let query = supabase.from('refunds').select('amount');
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    const { data } = await query;
    if (data) setTotalRefunds(data.reduce((sum, r) => sum + Number(r.amount), 0));
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('price');
    if (data) {
      setActiveProducts(data.length);
      setTotalProductValue(data.reduce((sum, p) => sum + Number(p.price), 0));
    }
  };

  const fetchOrders = async (from?: string, to?: string) => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    const { data } = await query;
    if (data) setOrders(data as OrderWithDetails[]);
  };

  const fetchChartData = async (from?: string, to?: string) => {
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    let ordersQuery = supabase.from('orders').select('total, created_at');
    let refundsQuery = supabase.from('refunds').select('amount, created_at');

    const startDate = from || defaultFrom.toISOString();
    ordersQuery = ordersQuery.gte('created_at', startDate);
    refundsQuery = refundsQuery.gte('created_at', startDate);
    if (to) {
      ordersQuery = ordersQuery.lte('created_at', to);
      refundsQuery = refundsQuery.lte('created_at', to);
    }

    const [ordersRes, refundsRes] = await Promise.all([ordersQuery, refundsQuery]);

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

  // CSV Export
  const exportOrdersCSV = () => {
    if (!orders.length) return;
    const headers = ['Customer', 'Email', 'Amount', 'Payment Method', 'Country', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.customer_name || 'N/A',
      o.customer_email || 'N/A',
      Number(o.total).toFixed(2),
      o.payment_method || 'N/A',
      o.country || 'N/A',
      o.status || 'pending',
      o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A',
    ]);
    downloadCSV([headers, ...rows], 'orders-export.csv');
  };

  const exportSalesCSV = () => {
    if (!chartData.length) return;
    const headers = ['Date', 'Sales', 'Refunds', 'Profit'];
    const rows = chartData.map((d) => [d.date, d.sales.toFixed(2), d.refunds.toFixed(2), d.profit.toFixed(2)]);
    downloadCSV([headers, ...rows], 'sales-export.csv');
  };

  const downloadCSV = (data: (string | number)[][], filename: string) => {
    const csv = data.map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h2>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[150px] justify-start text-left text-sm", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-1 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-gray-500">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[150px] justify-start text-left text-sm", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-1 h-4 w-4" />
                {dateTo ? format(dateTo, 'MMM d, yyyy') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} /> Profit & Loss
          </h3>
          <Button variant="outline" size="sm" onClick={exportSalesCSV} disabled={!chartData.length}>
            <Download className="mr-1 h-4 w-4" /> Export Sales CSV
          </Button>
        </div>
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
          <p className="text-gray-500 text-center py-8">No data available for the selected date range.</p>
        )}
      </Card>

      {/* Orders Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🛒 Recent Orders</h3>
          <Button variant="outline" size="sm" onClick={exportOrdersCSV} disabled={!orders.length}>
            <Download className="mr-1 h-4 w-4" /> Export Orders CSV
          </Button>
        </div>
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
          <p className="text-gray-500 text-center py-4">No orders for the selected date range.</p>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
