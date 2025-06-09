
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, User, Mail, Phone } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { OrderConfirmationPopup } from '../components/OrderConfirmationPopup';
import { useToast } from '../hooks/use-toast';

const Checkout = () => {
  const { state, dispatch } = useCart();
  const location = useLocation();
  const locationData = location.state?.locationData;
  const { toast } = useToast();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: locationData?.location || '',
    city: locationData?.city || '',
    state: '',
    zipCode: '',
    country: locationData?.country || '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    ecocashNumber: '',
    innbucksNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };

  const redirectToWhatsApp = () => {
    const whatsappNumber = '+263123456789'; // Replace with your actual WhatsApp number
    const message = `Hello! I have placed an order on your website. Order details: ${state.items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join(', ')}. Total: $${(total + 10 + (total * 0.08)).toFixed(2)}. Payment method: ${formData.paymentMethod}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendOrderConfirmationEmail = async () => {
    // This would typically be handled by a backend service
    console.log('Sending order confirmation email...');
    toast({
      title: "Email Sent",
      description: "Order confirmation has been sent to your email.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show confirmation popup
    setShowConfirmation(true);
    
    // Send email notification
    await sendOrderConfirmationEmail();
    
    // Clear cart
    dispatch({ type: 'CLEAR_CART' });
    
    // Redirect to WhatsApp after a short delay
    setTimeout(() => {
      redirectToWhatsApp();
    }, 2000);
  };

  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="flex items-center text-gray-600 hover:text-black mb-8">
          <ArrowLeft size={20} className="mr-2" />
          Back to Shopping
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-8">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      readOnly={!!locationData}
                      className={locationData ? "bg-gray-100" : ""}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        readOnly={!!locationData}
                        className={locationData ? "bg-gray-100" : ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ${locationData ? "bg-gray-100" : "bg-background"}`}
                        disabled={!!locationData}
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <RadioGroup value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="debit-card" id="debit-card" />
                      <Label htmlFor="debit-card">Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash-in-hand" id="cash-in-hand" />
                      <Label htmlFor="cash-in-hand">Cash in Hand</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ecocash" id="ecocash" />
                      <Label htmlFor="ecocash">EcoCash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="innbucks" id="innbucks" />
                      <Label htmlFor="innbucks">InnBucks</Label>
                    </div>
                  </RadioGroup>
                  
                  {(formData.paymentMethod === 'credit-card' || formData.paymentMethod === 'debit-card') && (
                    <>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.paymentMethod === 'ecocash' && (
                    <div>
                      <Label htmlFor="ecocashNumber">EcoCash Number</Label>
                      <Input
                        id="ecocashNumber"
                        name="ecocashNumber"
                        placeholder="077XXXXXXX"
                        value={formData.ecocashNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  {formData.paymentMethod === 'innbucks' && (
                    <div>
                      <Label htmlFor="innbucksNumber">InnBucks Number</Label>
                      <Input
                        id="innbucksNumber"
                        name="innbucksNumber"
                        placeholder="077XXXXXXX"
                        value={formData.innbucksNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Complete Order - ${(total + 10 + (total * 0.08)).toFixed(2)}
              </button>
            </form>

            {/* Payment Methods Support */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-4">We Support:</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded">
                  <CreditCard size={20} className="text-blue-600" />
                  <span className="text-sm font-medium">Visa</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded">
                  <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">EcoCash</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded">
                  <div className="w-5 h-5 bg-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium">InnBucks</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded">
                  <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
                  <span className="text-sm font-medium">Cash in Hand</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded">
                  <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">PayPal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {state.items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${(total + 10 + (total * 0.08)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <OrderConfirmationPopup 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default Checkout;
