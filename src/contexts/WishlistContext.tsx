
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlistItems: number[];
  productLikes: { [productId: number]: number };
  userLikes: { [productId: number]: boolean };
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  fetchProductLikes: () => Promise<void>;
  state: { items: number[] }; // Add this for backward compatibility
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [productLikes, setProductLikes] = useState<{ [productId: number]: number }>({});
  const [userLikes, setUserLikes] = useState<{ [productId: number]: boolean }>({});
  const { user } = useAuth();

  const fetchProductLikes = async () => {
    // For now, we'll work with mock data until the product_likes table is created
    console.log('Fetching product likes - table will be available after SQL migration');
    
    if (user) {
      // Mock some wishlist items from localStorage for now
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        setWishlistItems(items);
        const userLikeMap: { [productId: number]: boolean } = {};
        items.forEach((id: number) => {
          userLikeMap[id] = true;
        });
        setUserLikes(userLikeMap);
      }
    }
  };

  useEffect(() => {
    fetchProductLikes();
  }, [user]);

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyLiked = userLikes[productId];

      if (isCurrentlyLiked) {
        // Remove like
        setUserLikes(prev => ({ ...prev, [productId]: false }));
        setProductLikes(prev => ({ 
          ...prev, 
          [productId]: Math.max(0, (prev[productId] || 1) - 1) 
        }));
        setWishlistItems(prev => prev.filter(id => id !== productId));
        
        // Save to localStorage for now
        const newItems = wishlistItems.filter(id => id !== productId);
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newItems));
      } else {
        // Add like
        setUserLikes(prev => ({ ...prev, [productId]: true }));
        setProductLikes(prev => ({ 
          ...prev, 
          [productId]: (prev[productId] || 0) + 1 
        }));
        setWishlistItems(prev => [...prev, productId]);
        
        // Save to localStorage for now
        const newItems = [...wishlistItems, productId];
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newItems));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: number) => {
    return userLikes[productId] || false;
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      productLikes,
      userLikes,
      toggleWishlist,
      isInWishlist,
      fetchProductLikes,
      state: { items: wishlistItems } // Add this for backward compatibility
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
