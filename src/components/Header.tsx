
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart, X, Globe, Crown, Settings } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [tapCount, setTapCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  const languages = ['EN', 'ES', 'FR', 'DE', 'IT'];

  const handleSettingsClick = () => {
    // Single tap goes to settings page
    navigate('/settings');
    
    // Also track taps for admin access
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount === 7) {
        navigate('/admin');
        return 0;
      }
      // Reset count after 2 seconds of inactivity
      setTimeout(() => setTapCount(0), 2000);
      return newCount;
    });
  };
  
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and User Greeting */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link to="/" className="flex flex-col items-center hover:scale-105 transition-transform">
                <Crown size={24} className="text-blue-600 mb-1 animate-pulse" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">AURA</h1>
              </Link>
              {user && profile && (
                <div className="hidden sm:block">
                  <span className="text-sm text-blue-600">Hello, {profile.name}!</span>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link 
                to="/women" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/women') 
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Women
              </Link>
              <Link 
                to="/men" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/men') 
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Men
              </Link>
              <Link 
                to="/accessories" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/accessories') 
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Accessories
              </Link>
              <Link 
                to="/sale" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/sale') 
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Sale
              </Link>
            </nav>
            
            {/* Right side icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language Selector */}
              <div className="relative group hidden sm:block">
                <button className="flex items-center space-x-1 p-2 text-gray-700 hover:text-blue-600 transition-colors hover:scale-105">
                  <Globe size={16} />
                  <span className="text-sm">{selectedLanguage}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <button 
                onClick={handleSettingsClick}
                className="p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110"
              >
                <Settings size={18} />
              </button>
              
              {/* Search */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110"
              >
                <Search size={18} />
              </button>
              
              {/* Profile */}
              <Link to="/profile" className="p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110">
                <User size={18} />
              </Link>
              
              {/* Wishlist */}
              <Link to="/wishlist" className="p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110 relative">
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              
              {/* Cart - Integrated */}
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110 relative"
              >
                <ShoppingBag size={18} />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              {/* Mobile Menu */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile User Greeting */}
          {user && profile && (
            <div className="sm:hidden pb-2">
              <span className="text-sm text-blue-600">Hello, {profile.name}!</span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle className="text-blue-600">Menu</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <X size={20} />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/women" 
                className={`text-lg py-2 transition-colors ${
                  isActive('/women') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link 
                to="/men" 
                className={`text-lg py-2 transition-colors ${
                  isActive('/men') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link 
                to="/accessories" 
                className={`text-lg py-2 transition-colors ${
                  isActive('/accessories') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <Link 
                to="/sale" 
                className="text-lg text-blue-600 hover:text-blue-700 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
