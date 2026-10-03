import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/Navbar/Navbar";
import CartDrawer from "./components/Cart/CartDrawer";
import WishlistDrawer from "./components/Wishlist/WishlistDrawer";
import Hero from "./components/Hero/Hero";
import Benefits from "./components/Benefits/Benefits";
import PetCategories from "./components/PetCategories/PetCategories";
import CategoryGrid from "./components/CategoryGrid/CategoryGrid";
import FeaturedProducts from "./components/FeaturedProducts/FeaturedProducts";
import PetCare from "./components/PetCare/PetCare";
import Promotion from "./components/Promotion/Promotion";
import WhyJivvi from "./components/WhyJivvi/WhyJivvi";
import Testimonials from "./components/Testimonials/Testimonials";
import Newsletter from "./components/Newsletter/Newsletter";
import Footer from "./components/Footer/Footer";

// E-commerce Modals & Drawers
import AuthModal from "./components/Auth/AuthModal";
import CheckoutModal from "./components/Checkout/CheckoutModal";
import OrderConfirmationModal from "./components/Checkout/OrderConfirmationModal";
import AccountModal from "./components/Account/AccountModal";
import AdminDashboardModal from "./components/Admin/AdminDashboardModal";

function JivviApp() {
  const [activeCatalogFilter, setActiveCatalogFilter] = useState("all");

  // Modal display states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleFilterSelection = (filterId) => {
    setActiveCatalogFilter(filterId);
    const productsElem = document.getElementById("products");
    if (productsElem) {
      productsElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOrderConfirmed = (orderData) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(orderData);
  };

  return (
    <div className="jivvi-app">
      {/* Sticky Header with Navigation, Live Search & Drawer/Modal Triggers */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Page Flow */}
      <main id="main-content">
        {/* Section 10: Hero with Emotional Copy & Dual CTAs */}
        <Hero />

        {/* Section 11: Trust & Benefits Bar */}
        <Benefits />

        {/* Section 12: Shop by Pet (Dogs vs Cats) */}
        <PetCategories onSelectSpecies={handleFilterSelection} />

        {/* Section 13: Product Categories Grid */}
        <CategoryGrid onSelectCategory={handleFilterSelection} />

        {/* Section 14: Featured Products Showcase with Filters & Add-to-Cart */}
        <FeaturedProducts
          activeFilter={activeCatalogFilter}
          onFilterChange={setActiveCatalogFilter}
        />

        {/* Section 15: Pet Care Editorial Split Layout */}
        <PetCare />

        {/* Section 16: Promotional Seasonal Banner */}
        <Promotion onExploreOffers={() => handleFilterSelection("all")} />

        {/* Section 17: Why JIVVI 4-Pillar Value Proposition */}
        <WhyJivvi />

        {/* Section 18: Customer Testimonials */}
        <Testimonials />

        {/* Section 19: Newsletter Subscription */}
        <Newsletter />
      </main>

      {/* Section 20: Comprehensive Footer with WhatsApp Concierge */}
      <Footer />

      {/* Interactive Off-Canvas Drawers */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <WishlistDrawer />

      {/* Backend & E-Commerce Integrated Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => setIsAuthOpen(false)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOrderConfirmed={handleOrderConfirmed}
      />

      <OrderConfirmationModal
        isOpen={Boolean(confirmedOrder)}
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrder={() => {
          setConfirmedOrder(null);
          setIsAccountOpen(true);
        }}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenAdmin={() => {
          setIsAccountOpen(false);
          setIsAdminOpen(true);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <JivviApp />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}