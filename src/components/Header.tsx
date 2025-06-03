
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, Heart, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
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
  const { setIsSearchOpen } = useSearch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-2xl font-bold text-gray-900">LUXE</h1>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/#women" className="text-gray-700 hover:text-black transition-colors">Women</a>
              <a href="/#men" className="text-gray-700 hover:text-black transition-colors">Men</a>
              <a href="/#accessories" className="text-gray-700 hover:text-black transition-colors">Accessories</a>
              <a href="#sale" className="text-red-600 hover:text-red-700 transition-colors">Sale</a>
            </nav>
            
            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-black transition-colors"
              >
                <Search size={20} />
              </button>
              <Link to="/profile" className="p-2 text-gray-700 hover:text-black transition-colors">
                <User size={20} />
              </Link>
              <Link to="/wishlist" className="p-2 text-gray-700 hover:text-black transition-colors">
                <Heart size={20} />
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
              <a 
                href="/#women" 
                className="text-lg text-gray-700 hover:text-black transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </a>
              <a 
                href="/#men" 
                className="text-lg text-gray-700 hover:text-black transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </a>
              <a 
                href="/#accessories" 
                className="text-lg text-gray-700 hover:text-black transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
              </a>
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
