
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { SearchProvider } from "./contexts/SearchContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Index from "./pages/Index";
import Women from "./pages/Women";
import Men from "./pages/Men";
import Accessories from "./pages/Accessories";
import Sale from "./pages/Sale";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Shipping from "./pages/Shipping";
import CustomerService from "./pages/CustomerService";
import DeliveryRestriction from "./pages/DeliveryRestriction";
import EventPage from "./pages/EventPage";
import TrackOrder from "./pages/TrackOrder";
import Refund from "./pages/Refund";
import PaymentCallback from "./pages/PaymentCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <CartProvider>
            <SearchProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/women" element={<Women />} />
                    <Route path="/men" element={<Men />} />
                    <Route path="/accessories" element={<Accessories />} />
                    <Route path="/sale" element={<Sale />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/customer-service" element={<CustomerService />} />
                    <Route path="/delivery-restriction" element={<DeliveryRestriction />} />
                    <Route path="/event/:id" element={<EventPage />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/refund" element={<Refund />} />
                    <Route path="/payment-callback" element={<PaymentCallback />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SearchProvider>
          </CartProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
