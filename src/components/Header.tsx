
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart, X, Globe, Crown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSearch } from '../contexts/SearchContext';
import { SearchDialog } from './SearchDialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from './ui/drawer';

export const Header = () => {
  const { state, dispatch } = useCart();
  const { state: wishlistState } = useWishlist();
  const { setIsSearchOpen } = useSearch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const languages = ['EN', 'ES', 'FR', 'DE', 'IT'];
  
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex flex-col items-center">
                <Crown size={24} className="text-purple-600 mb-1" />
                <h1 className="text-xl font-bold text-gray-900">LUXE</h1>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/women" 
                className={`transition-colors ${
                  isActive('/women') 
                    ? 'text-purple-600 font-semibold border-b-2 border-purple-600 pb-1' 
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Women
              </Link>
              <Link 
                to="/men" 
                className={`transition-colors ${
                  isActive('/men') 
                    ? 'text-purple-600 font-semibold border-b-2 border-purple-600 pb-1' 
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Men
              </Link>
              <Link 
                to="/accessories" 
                className={`transition-colors ${
                  isActive('/accessories') 
                    ? 'text-purple-600 font-semibold border-b-2 border-purple-600 pb-1' 
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Accessories
              </Link>
              <a href="#sale" className="text-red-600 hover:text-red-700 transition-colors">Sale</a>
            </nav>
            
            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 text-gray-700 hover:text-black transition-colors">
                  <Globe size={16} />
                  <span className="text-sm">{selectedLanguage}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-black transition-colors"
              >
                <Search size={20} />
              </button>
              <Link to="/profile" className="p-2 text-gray-700 hover:text-black transition-colors">
                <User size={20} />
              </Link>
              <Link to="/wishlist" className="p-2 text-gray-700 hover:text-black transition-colors relative">
                <Heart size={20} />
                {wishlistState.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistState.items.length}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-2 text-gray-700 hover:text-black transition-colors relative"
              >
                <ShoppingBag size={20} />
                {state.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-700 hover:text-black transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 text-gray-700 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/women" 
                className={`text-lg py-2 transition-colors ${
                  isActive('/women') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link 
                to="/men" 
                className={`text-lg py-2 transition-colors ${
                  isActive('/men') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link 
                to="/accessories" 
                className={`text-lg py-2 transition-colors ${
                  isActive('/accessories') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-black'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <a 
                href="#sale" 
                className="text-lg text-red-600 hover:text-red-700 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sale
              </a>
            </nav>
          </div>
        </DrawerContent>
      </Drawer>

      <SearchDialog />
    </>
  );
};
