
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
    try {
      // Fetch all product likes to get counts
      const { data: allLikes, error: likesError } = await supabase
        .from('product_likes')
        .select('product_id');

      if (likesError) {
        console.error('Error fetching product likes:', likesError);
        return;
      }

      // Count likes per product
      const likeCounts: { [productId: number]: number } = {};
      allLikes.forEach((like) => {
        likeCounts[like.product_id] = (likeCounts[like.product_id] || 0) + 1;
      });
      setProductLikes(likeCounts);

      if (user) {
        // Fetch user's specific likes
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('product_likes')
          .select('product_id')
          .eq('user_id', user.id);

        if (userLikesError) {
          console.error('Error fetching user likes:', userLikesError);
          return;
        }

        const userLikeMap: { [productId: number]: boolean } = {};
        const wishlistItemIds: number[] = [];
        
        userLikesData.forEach((like) => {
          userLikeMap[like.product_id] = true;
          wishlistItemIds.push(like.product_id);
        });
        
        setUserLikes(userLikeMap);
        setWishlistItems(wishlistItemIds);
      }
    } catch (error) {
      console.error('Error in fetchProductLikes:', error);
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
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing like:', error);
          throw error;
        }

        // Update local state
        setUserLikes(prev => ({ ...prev, [productId]: false }));
        setProductLikes(prev => ({ 
          ...prev, 
          [productId]: Math.max(0, (prev[productId] || 1) - 1) 
        }));
        setWishlistItems(prev => prev.filter(id => id !== productId));
      } else {
        // Add like
        const { error } = await supabase
          .from('product_likes')
          .insert({
            product_id: productId,
            user_id: user.id
          });

        if (error) {
          console.error('Error adding like:', error);
          throw error;
        }

        // Update local state
        setUserLikes(prev => ({ ...prev, [productId]: true }));
        setProductLikes(prev => ({ 
          ...prev, 
          [productId]: (prev[productId] || 0) + 1 
        }));
        setWishlistItems(prev => [...prev, productId]);
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
      fetchProductLikes
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
