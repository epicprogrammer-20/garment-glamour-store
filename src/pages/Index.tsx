
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { CartProvider } from '../contexts/CartContext';

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header />
        <Hero />
        <ProductGrid />
        <Cart />
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Index;
