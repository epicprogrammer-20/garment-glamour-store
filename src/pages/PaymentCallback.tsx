import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase } from '@/integrations/supabase/client';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('failed');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-paystack', {
          body: { reference },
        });

        if (error || !data?.verified) {
          setStatus('failed');
          return;
        }

        setOrderData(data);
        setStatus('success');
      } catch {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Verifying your payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your payment of ${orderData?.amount?.toFixed(2)} has been confirmed.
            </p>
            <p className="text-sm text-muted-foreground">Reference: {reference}</p>
            <div className="pt-6 space-x-4">
              <Link to="/track-order" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Track Your Order
              </Link>
              <Link to="/" className="inline-block border border-border px-6 py-3 rounded-lg hover:bg-accent transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-muted-foreground">
              We couldn't verify your payment. Please try again or contact support.
            </p>
            <div className="pt-6 space-x-4">
              <Link to="/checkout" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Try Again
              </Link>
              <Link to="/contact" className="inline-block border border-border px-6 py-3 rounded-lg hover:bg-accent transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PaymentCallback;
