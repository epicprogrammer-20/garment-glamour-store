import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { LocationPopup } from './LocationPopup';

export const Cart = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const updateQuantity = (id: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id, size } });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } });
    }
  };

  const removeFromCart = (id: number, size: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, size } });
  };

  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (state.items.length > 0) {
      setShowLocationPopup(true);
    }
  };

  const handleLocationSubmit = (locationData: { country: string; city: string; location: string }) => {
    // Check if location is Zimbabwe and city is Harare
    if (locationData.country.toLowerCase() === 'zimbabwe' && locationData.city.toLowerCase() === 'harare') {
      // Navigate to checkout with location data
      navigate('/checkout', { state: { locationData } });
    } else {
      // Navigate to delivery restriction page
      navigate('/delivery-restriction');
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed top-4 right-4 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors">
            <ShoppingBag size={24} />
            {state.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {state.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>
          
          <div className="mt-8">
            {state.items.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="font-semibold">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-1">
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-1">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.size)} className="p-1 text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>Total: ${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <LocationPopup
        isOpen={showLocationPopup}
        onLocationSubmit={handleLocationSubmit}
        onClose={() => setShowLocationPopup(false)}
      />
    </>
  );
};
