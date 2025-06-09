
import React from 'react';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface OrderConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationPopup = ({ isOpen, onClose }: OrderConfirmationPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Order Received!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your order! We have received your order details and will process it shortly.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to WhatsApp to complete the order process.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
