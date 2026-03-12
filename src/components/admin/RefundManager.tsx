
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle2, XCircle, Clock, Eye, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const RefundImage = ({ path, index }: { path: string; index: number }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    supabase.storage.from('refunds').createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path]);
  if (!url) return <div className="w-full h-24 bg-muted rounded-lg animate-pulse" />;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img src={url} alt={`Refund image ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
    </a>
  );
};

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
  images: string[] | null;
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
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  const fetchRefunds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('refunds')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRefunds(data as unknown as Refund[]);
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

  const updateStatus = async (refund: Refund, newStatus: string) => {
    const { error } = await supabase.from('refunds').update({ status: newStatus }).eq('id', refund.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setRefunds(prev => prev.map(r => r.id === refund.id ? { ...r, status: newStatus } : r));
    toast({ title: 'Updated', description: `Refund marked as ${newStatus}` });

    // Send email notification
    if (refund.customer_email && (newStatus === 'approved' || newStatus === 'rejected')) {
      try {
        await supabase.functions.invoke('send-refund-status-email', {
          body: {
            email: refund.customer_email,
            customerName: refund.customer_name || 'Customer',
            trackingCode: refund.tracking_code || '',
            status: newStatus,
            amount: refund.amount,
          },
        });
      } catch (e) {
        console.error('Failed to send refund status email:', e);
      }
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
                <TableHead>Images</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map(refund => {
                const status = refund.status || 'pending';
                const config = statusConfig[status] || statusConfig.pending;
                const hasImages = refund.images && refund.images.length > 0;
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
                    </TableCell>
                    <TableCell>
                      {hasImages ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={() => setSelectedRefund(refund)}
                        >
                          <ImageIcon size={14} /> {refund.images!.length}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
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
                          variant="ghost"
                          className="text-xs h-7 px-2"
                          onClick={() => setSelectedRefund(refund)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 text-green-600 hover:bg-green-50"
                          onClick={() => updateStatus(refund, 'approved')}
                          disabled={status === 'approved'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
                          onClick={() => updateStatus(refund, 'rejected')}
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No refund requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Refund Detail Dialog */}
      <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tracking Code</p>
                  <p className="font-mono font-bold">{selectedRefund.tracking_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold">${Number(selectedRefund.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedRefund.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRefund.customer_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{format(new Date(selectedRefund.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason</p>
                <p className="text-sm font-medium">{selectedRefund.reason}</p>
              </div>

              {selectedRefund.message && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Message</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedRefund.message}</p>
                </div>
              )}

              {selectedRefund.images && selectedRefund.images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Uploaded Photos ({selectedRefund.images.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRefund.images.map((path, i) => (
                      <RefundImage key={i} path={path} index={i} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => { updateStatus(selectedRefund, 'approved'); setSelectedRefund(null); }}
                  disabled={selectedRefund.status === 'approved'}
                >
                  <CheckCircle2 size={16} className="mr-1" /> Approve & Email
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => { updateStatus(selectedRefund, 'rejected'); setSelectedRefund(null); }}
                  disabled={selectedRefund.status === 'rejected'}
                >
                  <XCircle size={16} className="mr-1" /> Reject & Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundManager;
