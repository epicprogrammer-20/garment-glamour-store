
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Download, Trash2, AlertTriangle } from 'lucide-react';

const DataBackupManager = () => {
  const [clearing, setClearing] = useState(false);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [exporting, setExporting] = useState(false);

  const downloadCSV = (data: (string | number)[][], filename: string) => {
    const csv = data.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllData = async () => {
    setExporting(true);
    try {
      // Fetch all data in parallel
      const [ordersRes, orderItemsRes, refundsRes, visitsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('order_items').select('*'),
        supabase.from('refunds').select('*').order('created_at', { ascending: false }),
        supabase.from('site_visits').select('*').order('visited_at', { ascending: false }),
      ]);

      const orders = ordersRes.data || [];
      const orderItems = orderItemsRes.data || [];
      const refunds = refundsRes.data || [];
      const visits = visitsRes.data || [];

      // Orders CSV
      if (orders.length > 0) {
        const headers = ['ID', 'Customer', 'Email', 'Total', 'Payment Method', 'Country', 'Status', 'Tracking Code', 'Created At', 'Estimated Delivery'];
        const rows = orders.map(o => [
          o.id, o.customer_name || 'N/A', o.customer_email || 'N/A',
          Number(o.total).toFixed(2), o.payment_method || 'N/A', o.country || 'N/A',
          o.status || 'pending', o.tracking_code || 'N/A',
          o.created_at ? new Date(o.created_at).toLocaleString() : 'N/A',
          o.estimated_delivery ? new Date(o.estimated_delivery).toLocaleString() : 'N/A',
        ]);
        downloadCSV([headers, ...rows], `orders-backup-${new Date().toISOString().slice(0, 10)}.csv`);
      }

      // Order Items CSV
      if (orderItems.length > 0) {
        const headers = ['ID', 'Order ID', 'Product Name', 'Size', 'Quantity', 'Price', 'Product ID'];
        const rows = orderItems.map(i => [
          i.id, i.order_id, i.product_name, i.size || 'N/A',
          i.quantity, Number(i.price).toFixed(2), i.product_id || 'N/A',
        ]);
        downloadCSV([headers, ...rows], `order-items-backup-${new Date().toISOString().slice(0, 10)}.csv`);
      }

      // Refunds CSV
      if (refunds.length > 0) {
        const headers = ['ID', 'Order ID', 'Customer', 'Email', 'Amount', 'Reason', 'Status', 'Tracking Code', 'Message', 'Created At'];
        const rows = refunds.map(r => [
          r.id, r.order_id || 'N/A', r.customer_name || 'N/A', r.customer_email || 'N/A',
          Number(r.amount).toFixed(2), r.reason || 'N/A', r.status || 'pending',
          r.tracking_code || 'N/A', (r.message || 'N/A').replace(/"/g, "'"),
          new Date(r.created_at).toLocaleString(),
        ]);
        downloadCSV([headers, ...rows], `refunds-backup-${new Date().toISOString().slice(0, 10)}.csv`);
      }

      // Site Visits CSV
      if (visits.length > 0) {
        const headers = ['ID', 'Page', 'Country', 'User Agent', 'Session ID', 'Visited At'];
        const rows = visits.map(v => [
          v.id, v.page || '/', v.country || 'N/A',
          (v.user_agent || 'N/A').replace(/"/g, "'"), v.session_id || 'N/A',
          new Date(v.visited_at).toLocaleString(),
        ]);
        downloadCSV([headers, ...rows], `site-visits-backup-${new Date().toISOString().slice(0, 10)}.csv`);
      }

      toast({ title: 'Backup Complete', description: `Exported ${orders.length} orders, ${orderItems.length} order items, ${refunds.length} refunds, ${visits.length} visits.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export data.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      // Delete in correct order (order_items before orders due to FK)
      await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('refunds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('site_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({ title: 'Data Cleared', description: 'All orders, refunds, and site visits have been permanently deleted.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear data.', variant: 'destructive' });
    } finally {
      setClearing(false);
      setShowConfirm2(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🗄️ Data Backup & Management</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Export all analytics data (orders, order items, refunds, site visits) to CSV files, or clear all transactional data.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportAllData} disabled={exporting} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Backup All Data to CSV'}
        </Button>
        <Button onClick={() => setShowConfirm1(true)} variant="destructive" disabled={clearing}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Data
        </Button>
      </div>

      {/* First confirmation */}
      <Dialog open={showConfirm1} onOpenChange={setShowConfirm1}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" size={20} />
              Are you sure you want to clear all data?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all orders, order items, refunds, and site visit records. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm1(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setShowConfirm1(false); setShowConfirm2(true); }}>
              Yes, I want to clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Second confirmation */}
      <Dialog open={showConfirm2} onOpenChange={setShowConfirm2}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              This is NOT reversible!
            </DialogTitle>
            <DialogDescription className="font-semibold">
              Make sure you have backed up your data before clearing. Once deleted, all orders, refunds, and analytics data will be gone forever. Are you absolutely sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm2(false)}>Cancel, go back</Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={clearing}>
              {clearing ? 'Clearing...' : 'Permanently Delete Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DataBackupManager;
