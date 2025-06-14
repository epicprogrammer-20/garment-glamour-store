
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Accessories = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="mb-6 hover:bg-white/10 border-white/30 text-white hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Accessories Collection</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Complete your look with our curated selection of premium accessories. 
              The perfect finishing touch for any outfit.
            </p>
          </div>
        </div>
      </section>

      <ProductGrid category="accessories" />
      
      <Footer />
    </div>
  );
};

export default Accessories;
