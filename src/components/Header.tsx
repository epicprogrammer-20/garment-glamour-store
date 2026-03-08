
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart, X, Crown, Settings } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { useCurrency } from '../contexts/CurrencyContext';
import { SearchDialog } from './SearchDialog';
import { Cart } from './Cart';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from './ui/drawer';

export const Header = () => {
  const { state, dispatch } = useCart();
  const { wishlistItems } = useWishlist();
  const { setIsSearchOpen } = useSearch();
  const { user } = useAuth();
  const { profile } = useUserData();
  const { currency, setCurrency, rates } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const handleSettingsClick = () => {
    navigate('/settings');
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount === 7) {
        navigate('/admin');
        return 0;
      }
      setTimeout(() => setTapCount(0), 2000);
      return newCount;
    });
  };

  const currentRate = rates.find(r => r.currency_code === currency);
  
  return (
    <>
      <header className="bg-background shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
                <Crown size={24} className="text-primary mb-1 animate-pulse" />
                <h1 className="text-lg sm:text-xl font-bold text-foreground">AURA</h1>
              </Link>
              {user && profile && (
                <div className="hidden sm:block">
                  <span className="text-sm text-primary">Hello, {profile.name}!</span>
                </div>
              )}
            </div>
            
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              {[
                { path: '/women', label: 'Women' },
                { path: '/men', label: 'Men' },
                { path: '/accessories', label: 'Accessories' },
              ].map(item => (
                <Link key={item.path} to={item.path} className={`transition-all duration-300 hover:scale-105 ${isActive(item.path) ? 'text-primary font-semibold border-b-2 border-primary pb-1' : 'text-foreground hover:text-primary'}`}>
                  {item.label}
                </Link>
              ))}
              <Link to="/sale" className={`transition-all duration-300 hover:scale-105 ${isActive('/sale') ? 'text-primary font-semibold border-b-2 border-primary pb-1' : 'text-primary hover:text-primary/80'}`}>
                Sale
              </Link>
            </nav>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Currency Selector */}
              <div className="relative group hidden sm:block">
                <button className="flex items-center space-x-1 p-2 text-foreground hover:text-primary transition-colors hover:scale-105">
                  <span className="text-sm font-medium">{currentRate?.symbol || '$'}</span>
                  <span className="text-xs">{currency}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
                  {rates.map(r => (
                    <button
                      key={r.currency_code}
                      onClick={() => setCurrency(r.currency_code)}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-accent ${currency === r.currency_code ? 'bg-accent font-semibold' : 'text-foreground'}`}
                    >
                      {r.symbol} {r.currency_code}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSettingsClick} className="p-2 text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
                <Settings size={18} />
              </button>
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
                <Search size={18} />
              </button>
              <Link to="/profile" className="p-2 text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
                <User size={18} />
              </Link>
              <Link to="/wishlist" className="p-2 text-foreground hover:text-primary transition-all duration-300 hover:scale-110 relative">
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <button onClick={() => dispatch({ type: 'TOGGLE_CART' })} className="p-2 text-foreground hover:text-primary transition-all duration-300 hover:scale-110 relative">
                <ShoppingBag size={18} />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-foreground hover:text-primary transition-colors">
                <Menu size={18} />
              </button>
            </div>
          </div>
          
          {user && profile && (
            <div className="sm:hidden pb-2">
              <span className="text-sm text-primary">Hello, {profile.name}!</span>
            </div>
          )}
        </div>
      </header>

      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle className="text-primary">Menu</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 text-foreground hover:text-primary transition-colors"><X size={20} /></button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {/* Mobile Currency Selector */}
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground mb-2">Currency</p>
              <div className="flex flex-wrap gap-2">
                {rates.map(r => (
                  <button
                    key={r.currency_code}
                    onClick={() => setCurrency(r.currency_code)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${currency === r.currency_code ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground'}`}
                  >
                    {r.symbol} {r.currency_code}
                  </button>
                ))}
              </div>
            </div>
            <nav className="flex flex-col space-y-4">
              {[
                { path: '/women', label: 'Women' },
                { path: '/men', label: 'Men' },
                { path: '/accessories', label: 'Accessories' },
              ].map(item => (
                <Link key={item.path} to={item.path} className={`text-lg py-2 transition-colors ${isActive(item.path) ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link to="/sale" className="text-lg text-primary hover:text-primary/80 transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Sale
              </Link>
            </nav>
          </div>
        </DrawerContent>
      </Drawer>

      <SearchDialog />
      <Cart />
    </>
  );
};
