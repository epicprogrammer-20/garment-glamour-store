
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { SecondaryNavbar } from '../components/SecondaryNavbar';
import { Hero } from '../components/Hero';
import { VideoSection } from '../components/VideoSection';
import { ImageGallery } from '../components/ImageGallery';
import { ProductGrid } from '../components/ProductGrid';
import { SocialMedia } from '../components/SocialMedia';
import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <SecondaryNavbar />
      <Header />
      <Hero />
      <VideoSection />
      <ImageGallery />
      <ProductGrid />
      <SocialMedia />
      <Cart />
      <Footer />
    </div>
  );
};

export default Index;
