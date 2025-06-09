
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
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
    if (locationData.country.toLowerCase() === 'zimbabwe' && locationData.city.toLowerCase() === 'harare') {
      navigate('/checkout', { state: { locationData } });
    } else {
      navigate('/delivery-restriction');
    }
  };

  return (
    <>
      <Sheet open={state.isOpen} onOpenChange={() => dispatch({ type: 'TOGGLE_CART' })}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-blue-600">Shopping Cart</SheetTitle>
          </SheetHeader>
          
          <div className="mt-8">
            {state.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-2">Start shopping to add items!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4 p-4 border border-blue-100 rounded-lg hover:shadow-md transition-shadow">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-blue-600">Size: {item.size}</p>
                        <p className="font-semibold text-gray-900">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} 
                          className="p-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Minus size={16} className="text-blue-600" />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} 
                          className="p-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Plus size={16} className="text-blue-600" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size)} 
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-blue-100">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>Total: ${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
