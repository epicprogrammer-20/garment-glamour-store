
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  size?: string;
}

interface CartItem extends Product {
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Product & { size: string; quantity?: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { id: number; size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; size: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const addQty = action.payload.quantity || 1;
      const existingItem = state.items.find(item => item.id === action.payload.id && item.size === action.payload.size);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id && item.size === action.payload.size
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: addQty }];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => !(item.id === action.payload.id && item.size === action.payload.size));
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id && item.size === action.payload.size
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { ...state, items: newItems, total };
    }
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
