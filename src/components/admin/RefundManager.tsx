
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Refund {
  id: string;
  order_id: string | null;
  amount: number;
  reason: string | null;
  status: string | null;
  customer_email: string | null;
  customer_name: string | null;
  tracking_code: string | null;
  message: string | null;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
  processed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={14} /> },
  approved: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={14} /> },
  rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
};

const RefundManager = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('refunds')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRefunds(data as Refund[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRefunds();
    const channel = supabase
      .channel('refunds-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refunds' }, () => fetchRefunds())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('refunds').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast({ title: 'Updated', description: `Refund marked as ${newStatus}` });
    }
  };

  if (loading) return <div className="text-center py-8">Loading refunds...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Refund Requests</h2>
        <Button variant="outline" size="sm" onClick={fetchRefunds}><RefreshCw size={14} /></Button>
      </div>

      <Card className="p-2 sm:p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map(refund => {
                const status = refund.status || 'pending';
                const config = statusConfig[status] || statusConfig.pending;
                return (
                  <TableRow key={refund.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(refund.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-mono font-bold">{refund.tracking_code || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{refund.customer_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{refund.customer_email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${Number(refund.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[200px] truncate" title={refund.reason || ''}>
                        {refund.reason || 'N/A'}
                      </p>
                      {refund.message && (
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={refund.message}>
                          {refund.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${config.color} text-xs capitalize gap-1`}>
                        {config.icon} {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 text-green-600 hover:bg-green-50"
                          onClick={() => updateStatus(refund.id, 'approved')}
                          disabled={status === 'approved'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
                          onClick={() => updateStatus(refund.id, 'rejected')}
                          disabled={status === 'rejected'}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {refunds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No refund requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default RefundManager;
