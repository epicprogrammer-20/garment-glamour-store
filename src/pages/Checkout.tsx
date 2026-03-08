
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, User } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { OrderConfirmationPopup } from '../components/OrderConfirmationPopup';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface ProductFees {
  shipping_cost: number;
  duty_fee: number;
  tax_rate: number;
}

const Checkout = () => {
  const { state, dispatch } = useCart();
  const location = useLocation();
  const locationData = location.state?.locationData;
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productFees, setProductFees] = useState<Record<number, ProductFees>>({});
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    address: locationData?.location || '', city: locationData?.city || '', state: '', zipCode: '', country: locationData?.country || '',
    paymentMethod: 'credit-card', cardNumber: '', expiryDate: '', cvv: '', cardName: '', ecocashNumber: '', innbucksNumber: ''
  });

  useEffect(() => {
    const fetchFees = async () => {
      const productIds = state.items.map(item => item.id);
      if (productIds.length === 0) return;
      const { data } = await supabase.from('products').select('id, shipping_cost, duty_fee, tax_rate').in('id', productIds);
      if (data) {
        const fees: Record<number, ProductFees> = {};
        data.forEach((p: any) => { fees[p.id] = { shipping_cost: p.shipping_cost || 0, duty_fee: p.duty_fee || 0, tax_rate: p.tax_rate || 0 }; });
        setProductFees(fees);
      }
    };
    fetchFees();
  }, [state.items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const totalShipping = state.items.reduce((sum, item) => {
    const fees = productFees[item.id];
    return sum + (fees?.shipping_cost || 0) * item.quantity;
  }, 0);

  const totalDuty = state.items.reduce((sum, item) => {
    const fees = productFees[item.id];
    return sum + (fees?.duty_fee || 0) * item.quantity;
  }, 0);

  const totalTax = state.items.reduce((sum, item) => {
    const fees = productFees[item.id];
    const taxRate = fees?.tax_rate || 0;
    return sum + (item.price * item.quantity * taxRate / 100);
  }, 0);

  const grandTotal = subtotal + totalShipping + totalDuty + totalTax;

  const redirectToWhatsApp = () => {
    const whatsappNumber = '+263123456789';
    const message = `Hello! I have placed an order. Items: ${state.items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join(', ')}. Total: $${grandTotal.toFixed(2)}. Payment: ${formData.paymentMethod}`;
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const [trackingCode, setTrackingCode] = useState('');

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const saveOrder = async (code: string, paymentMethod: string, skipEmail = false) => {
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      total: grandTotal, payment_method: paymentMethod, country: formData.country,
      customer_email: formData.email, customer_name: formData.fullName, status: 'placed',
      tracking_code: code,
    }).select('id').single();

    if (orderData && !orderError) {
      const items = state.items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));
      await supabase.from('order_items').insert(items);

      if (formData.email && !skipEmail) {
        try {
          await supabase.functions.invoke('send-order-confirmation', {
            body: {
              email: formData.email,
              customerName: formData.fullName,
              trackingCode: code,
              items: state.items.map(item => ({
                name: item.name, image: item.image, size: item.size,
                quantity: item.quantity, price: item.price,
              })),
              total: grandTotal,
              paymentMethod: paymentMethod,
            },
          });
        } catch (e) {
          console.error('Failed to send order confirmation email:', e);
        }
      }
      return orderData.id;
    }
    return null;
  };

  const handlePaystackPayment = async (code: string) => {
    setIsProcessing(true);
    try {
      const orderId = await saveOrder(code, 'paystack-card');
      if (!orderId) {
        toast({ title: 'Error', description: 'Failed to create order', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }

      const callbackUrl = `${window.location.origin}/payment-callback`;
      const { data, error } = await supabase.functions.invoke('initialize-paystack', {
        body: {
          email: formData.email,
          amount: grandTotal,
          callback_url: callbackUrl,
          metadata: { order_id: orderId, tracking_code: code },
        },
      });

      if (error || !data?.authorization_url) {
        toast({ title: 'Payment Error', description: 'Failed to initialize payment. Please try again.', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }

      dispatch({ type: 'CLEAR_CART' });
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error('Paystack error:', err);
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateTrackingCode();

    if (formData.paymentMethod === 'credit-card' || formData.paymentMethod === 'debit-card') {
      await handlePaystackPayment(code);
      return;
    }

    // Non-card payments: original flow
    try {
      await saveOrder(code, formData.paymentMethod);
    } catch (err) { console.error('Failed to save order:', err); }
    setTrackingCode(code);
    setShowConfirmation(true);
    dispatch({ type: 'CLEAR_CART' });
    setTimeout(() => redirectToWhatsApp(), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={20} className="mr-2" /> Back to Shopping
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-card rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center"><User className="mr-2" size={20} /> Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required /></div>
                  <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                  <div className="md:col-span-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required /></div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center"><MapPin className="mr-2" size={20} /> Shipping Address</h2>
                <div className="space-y-4">
                  <div><Label htmlFor="address">Street Address</Label><Input id="address" name="address" value={formData.address} onChange={handleInputChange} readOnly={!!locationData} className={locationData ? "bg-muted" : ""} required /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="city">City</Label><Input id="city" name="city" value={formData.city} onChange={handleInputChange} readOnly={!!locationData} className={locationData ? "bg-muted" : ""} required /></div>
                    <div><Label htmlFor="state">State/Province</Label><Input id="state" name="state" value={formData.state} onChange={handleInputChange} required /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="zipCode">ZIP/Postal Code</Label><Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required /></div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <select id="country" name="country" value={formData.country} onChange={handleInputChange} className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ${locationData ? "bg-muted" : "bg-background"}`} disabled={!!locationData} required>
                        <option value="">Select Country</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="South Africa">South Africa</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center"><CreditCard className="mr-2" size={20} /> Payment Method</h2>
                <RadioGroup value={formData.paymentMethod} onValueChange={v => setFormData(p => ({ ...p, paymentMethod: v }))}>
                  {[{ value: 'credit-card', label: 'Credit Card' }, { value: 'debit-card', label: 'Debit Card' }, { value: 'paypal', label: 'PayPal' }, { value: 'cash-in-hand', label: 'Cash in Hand' }, { value: 'ecocash', label: 'EcoCash' }, { value: 'innbucks', label: 'InnBucks' }].map(pm => (
                    <div key={pm.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={pm.value} id={pm.value} />
                      <Label htmlFor={pm.value}>{pm.label}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {(formData.paymentMethod === 'credit-card' || formData.paymentMethod === 'debit-card') && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">💳 You'll be securely redirected to Paystack to enter your card details.</p>
                  </div>
                )}
                {formData.paymentMethod === 'ecocash' && <div className="mt-4"><Label htmlFor="ecocashNumber">EcoCash Number</Label><Input id="ecocashNumber" name="ecocashNumber" placeholder="077XXXXXXX" value={formData.ecocashNumber} onChange={handleInputChange} required /></div>}
                {formData.paymentMethod === 'innbucks' && <div className="mt-4"><Label htmlFor="innbucksNumber">InnBucks Number</Label><Input id="innbucksNumber" name="innbucksNumber" placeholder="077XXXXXXX" value={formData.innbucksNumber} onChange={handleInputChange} required /></div>}
              </div>

              <button type="submit" disabled={isProcessing} className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50">
                {isProcessing ? 'Processing...' : (formData.paymentMethod === 'credit-card' || formData.paymentMethod === 'debit-card') ? `Pay with Card - ${formatPrice(grandTotal)}` : `Complete Order - ${formatPrice(grandTotal)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {state.items.map((item) => {
                const fees = productFees[item.id];
                const itemTax = fees ? item.price * item.quantity * (fees.tax_rate || 0) / 100 : 0;
                return (
                  <div key={`${item.id}-${item.size}`} className="border-b border-border pb-3">
                    <div className="flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    {fees && (fees.shipping_cost > 0 || fees.duty_fee > 0 || fees.tax_rate > 0) && (
                      <div className="mt-2 ml-20 text-xs text-muted-foreground space-y-0.5">
                        {fees.shipping_cost > 0 && <p>Shipping: {formatPrice(fees.shipping_cost * item.quantity)}</p>}
                        {fees.duty_fee > 0 && <p>Duty: {formatPrice(fees.duty_fee * item.quantity)}</p>}
                        {fees.tax_rate > 0 && <p>Tax ({fees.tax_rate}%): {formatPrice(itemTax)}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {totalShipping > 0 && <div className="flex justify-between text-sm"><span>Shipping</span><span>{formatPrice(totalShipping)}</span></div>}
              {totalDuty > 0 && <div className="flex justify-between text-sm"><span>Duty Fees</span><span>{formatPrice(totalDuty)}</span></div>}
              {totalTax > 0 && <div className="flex justify-between text-sm"><span>Tax</span><span>{formatPrice(totalTax)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <OrderConfirmationPopup isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} trackingCode={trackingCode} />
    </div>
  );
};

export default Checkout;
