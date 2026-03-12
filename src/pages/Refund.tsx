
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { AlertCircle, CheckCircle2, Clock, Search, Upload, X, ImageIcon } from 'lucide-react';

const REFUND_REASONS = [
  'Item arrived damaged',
  'Wrong item received',
  'Item does not match description',
  'Item no longer needed',
  'Quality not as expected',
  'Other',
] as const;

const Refund = () => {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const lookupOrder = async () => {
    if (!trackingCode.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_code', trackingCode.trim().toUpperCase())
      .single();

    if (err || !data) {
      setError('No order found with that tracking code.');
      setLoading(false);
      return;
    }

    if (data.status !== 'delivered') {
      setError('Refunds can only be requested for delivered orders. Please wait until your order is delivered.');
      setLoading(false);
      return;
    }

    setOrder(data);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({ title: 'Maximum 5 images allowed', variant: 'destructive' });
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const paths: string[] = [];
    for (const file of images) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('refunds').upload(path, file);
      if (!error) {
        paths.push(path);
      }
    }
    return paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast({ title: 'Please select a reason', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setUploading(true);

    let imageUrls: string[] = [];
    if (images.length > 0) {
      imageUrls = await uploadImages();
    }
    setUploading(false);

    const { error: err } = await supabase.from('refunds').insert({
      order_id: order.id,
      amount: order.total,
      reason: reason === 'Other' ? customMessage : reason,
      status: 'pending',
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      tracking_code: order.tracking_code,
      message: customMessage || null,
      images: imageUrls,
    });

    if (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } else {
      setSubmitted(true);
      toast({ title: 'Refund request submitted successfully' });
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-2">Refund Request Submitted</h1>
          <p className="text-muted-foreground mb-4">
            Your refund request for order <span className="font-mono font-bold">{order.tracking_code}</span> has been received.
          </p>
          <Card className="p-6 text-left space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="text-amber-500 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-sm">Refund Processing Time</p>
                <p className="text-sm text-muted-foreground">Refund processing takes up to <strong>6 hours</strong> once approved.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-500 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-sm">Refund Policy</p>
                <p className="text-sm text-muted-foreground">Refunds can be requested within <strong>48 hours</strong> after delivery.</p>
              </div>
            </div>
          </Card>
          <Button onClick={() => { setSubmitted(false); setOrder(null); setTrackingCode(''); setReason(''); setCustomMessage(''); setImages([]); setImagePreviews([]); }}>
            Submit Another Request
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Request a Refund</h1>
        <p className="text-center text-muted-foreground mb-2">Enter your tracking code to begin your refund request</p>

        <Card className="p-6 mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-200">Refund Policy</p>
              <ul className="text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                <li>• Refunds can only be requested within <strong>48 hours</strong> after delivery</li>
                <li>• Refund processing takes up to <strong>6 hours</strong> once approved</li>
                <li>• Only delivered orders are eligible for refund</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter tracking code (e.g. A1B2C)"
            value={trackingCode}
            onChange={e => setTrackingCode(e.target.value.toUpperCase())}
            maxLength={5}
            className="text-center text-lg tracking-widest font-mono"
            onKeyDown={e => e.key === 'Enter' && lookupOrder()}
          />
          <Button onClick={lookupOrder} disabled={loading}>
            <Search size={16} className="mr-1" /> Find Order
          </Button>
        </div>

        {error && <p className="text-center text-destructive mb-4">{error}</p>}

        {order && (
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="text-lg font-bold font-mono">{order.tracking_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-bold">${Number(order.total).toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Why are you requesting a refund?</Label>
                <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                  {REFUND_REASONS.map(r => (
                    <div key={r} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={r} id={r} />
                      <Label htmlFor={r} className="cursor-pointer flex-1">{r}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="message" className="text-base font-semibold mb-2 block">
                  Additional Details {reason !== 'Other' && <span className="text-muted-foreground font-normal text-sm">(optional)</span>}
                </Label>
                <Textarea
                  id="message"
                  placeholder="Please provide more details about your refund request..."
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={4}
                  required={reason === 'Other'}
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label className="text-base font-semibold mb-2 block">
                  Upload Photos <span className="text-muted-foreground font-normal text-sm">(optional, max 5)</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload photos of the product to support your refund request
                </p>
                <div className="flex flex-wrap gap-3 mb-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                      <img src={preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Upload size={18} className="text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading || !reason || uploading}>
                {uploading ? 'Uploading images...' : 'Submit Refund Request'}
              </Button>
            </form>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Refund;
