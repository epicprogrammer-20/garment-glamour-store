
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
  discountPercentage?: number;
  isOnSale?: boolean;
  is_out_of_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, productLikes } = useWishlist();
  const { formatPrice } = useCurrency();

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const likeCount = productLikes[product.id] || 0;
  const isLiked = isInWishlist(product.id);

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden rounded-lg bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105 ${product.is_out_of_stock ? 'opacity-60' : ''}`}
        />
        <button
          onClick={handleHeartClick}
          className="absolute top-4 right-4 p-2 bg-background rounded-full shadow-md hover:bg-muted transition-colors"
        >
          <Heart size={20} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>
        {likeCount > 0 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
            {likeCount} ❤️
          </div>
        )}
        {product.is_out_of_stock && (
          <div className="absolute top-14 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
            Out of Stock
          </div>
        )}
        {product.isOnSale && product.discountPercentage && !product.is_out_of_stock && (
          <div className="absolute bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-foreground">{product.name}</h3>
        <p className="text-muted-foreground capitalize">{product.category}</p>
        <div className="mt-1">
          {product.isOnSale && product.originalPrice ? (
            <div className="flex items-center space-x-2">
              <p className="text-xl font-bold text-destructive">{formatPrice(product.price)}</p>
              <p className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
            </div>
          ) : (
            <p className="text-xl font-bold text-foreground">{formatPrice(product.price)}</p>
          )}
        </div>
      </div>
    </div>
  );
};
