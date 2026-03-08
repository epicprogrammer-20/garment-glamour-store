
import React from 'react';
import { Header } from '../components/Header';
import { SecondaryNavbar } from '../components/SecondaryNavbar';
import { Hero } from '../components/Hero';
import PromoBanner from '../components/PromoBanner';
import EventBanner from '../components/EventBanner';
import { VideoSection } from '../components/VideoSection';
import { ImageGallery } from '../components/ImageGallery';
import { ProductGrid } from '../components/ProductGrid';
import { Cart } from '../components/Cart';
import { Footer } from '../components/Footer';
import { CookieConsent } from '../components/CookieConsent';
import { useVisitTracker } from '../hooks/useVisitTracker';

const Index = () => {
  useVisitTracker();
  return (
    <div className="min-h-screen bg-background">
      <SecondaryNavbar />
      <Header />
      <PromoBanner />
      <EventBanner />
      <Hero />
      <VideoSection />
      <ImageGallery />
      <ProductGrid />
      <Cart />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
