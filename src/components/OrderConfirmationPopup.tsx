
import React from 'react';
import { Check, X, Copy, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OrderConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trackingCode?: string;
}

export const OrderConfirmationPopup = ({ isOpen, onClose, trackingCode }: OrderConfirmationPopupProps) => {
  const navigate = useNavigate();

  const copyCode = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      toast({ title: 'Copied!', description: 'Tracking code copied to clipboard' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Order Received!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your order! We have received your order details and will process it shortly.
          </p>
          
          {trackingCode && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Your Tracking Code</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold font-mono tracking-widest">{trackingCode}</span>
                <Button variant="ghost" size="sm" onClick={copyCode}>
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Save this code to track your order</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            You will be redirected to WhatsApp to complete the order process.
          </p>
        </div>

        <div className="flex gap-2 justify-center mt-4">
          {trackingCode && (
            <Button variant="outline" onClick={() => { onClose(); navigate('/track-order'); }}>
              <Package size={16} className="mr-1" /> Track Order
            </Button>
          )}
          <Button onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
