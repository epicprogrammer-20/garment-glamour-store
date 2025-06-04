
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { SearchProvider } from "./contexts/SearchContext";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Women from "./pages/Women";
import Men from "./pages/Men";
import Accessories from "./pages/Accessories";
import Checkout from "./pages/Checkout";
import CustomerService from "./pages/CustomerService";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Help from "./pages/Help";
import DeliveryRestriction from "./pages/DeliveryRestriction";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/women" element={<Women />} />
                <Route path="/men" element={<Men />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/customer-service" element={<CustomerService />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/help" element={<Help />} />
                <Route path="/delivery-restriction" element={<DeliveryRestriction />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
