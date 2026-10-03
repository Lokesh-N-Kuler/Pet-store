import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import MobileMenu from "./MobileMenu";
import SearchModal from "../Search/SearchModal";

export default function Navbar({ onOpenAuth, onOpenAccount, onOpenAdmin }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const { totalWishlist, openWishlist } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAccountNotice, setShowAccountNotice] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`jivvi-navbar ${isScrolled ? "jivvi-navbar--scrolled" : ""}`}>
        {/* Top Announcement Bar */}
        <div className="jivvi-top-bar">
          <div className="jivvi-top-bar-inner">
            <span className="jivvi-top-bar-text">
              🐾 Starting in Bengaluru • Free Same-Day Express Delivery on Orders Over ₹999 • 100% Pet-Safe
            </span>
            <div className="jivvi-top-bar-contact">
              <a
                href="https://wa.me/919886193296?text=Hi%20JIVVI,%20I'd%20like%20to%20know%20more%20about%20your%20pet%20care%20products"
                target="_blank"
                rel="noreferrer"
                className="top-bar-wa-link"
              >
                <span className="wa-dot"></span> WhatsApp Support
              </a>
            </div>
          </div>
        </div>

        {/* Main Nav Container */}
        <div className="nav-container">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>

          {/* Brand Logo */}
          <a href="#home" className="jivvi-brand-logo" aria-label="JIVVI Home">
            <img
              src="/images/logo.jpg"
              alt="JIVVI - Pet Care & Pet Products"
              className="jivvi-logo-image"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="nav-links" aria-label="Main Navigation">
            <a href="#home" className="nav-link">Home</a>
            <a href="#products" className="nav-link">Shop</a>
            <a href="#shop-pet" className="nav-link">Dogs</a>
            <a href="#shop-pet" className="nav-link">Cats</a>
            <a href="#pet-care" className="nav-link">Pet Care</a>
            <a href="#about" className="nav-link">About Us</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          {/* Right Action Icons & CTA */}
          <div className="nav-actions">
            {/* Search */}
            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              title="Search"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Wishlist */}
            <button
              type="button"
              className="nav-icon-btn nav-icon-badge-wrap"
              onClick={openWishlist}
              aria-label={`Wishlist with ${totalWishlist} items`}
              title="Wishlist"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {totalWishlist > 0 && (
                <span className="nav-badge nav-badge--wishlist">{totalWishlist}</span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              className="nav-icon-btn nav-icon-badge-wrap"
              onClick={openCart}
              aria-label={`Shopping cart with ${totalItems} items`}
              title="Cart"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="nav-badge nav-badge--cart">{totalItems}</span>
              )}
            </button>

            {/* Account & Profile */}
            <div className="account-popover-wrapper">
              <button
                type="button"
                className={`nav-icon-btn ${user ? "nav-icon-btn--active-user" : ""}`}
                onClick={() => {
                  if (!user) {
                    if (onOpenAuth) onOpenAuth();
                  } else {
                    setShowAccountNotice(!showAccountNotice);
                  }
                }}
                aria-label={user ? `Account for ${profile?.full_name || user.email}` : "Sign In or Register"}
                title={user ? (isAdmin ? "Admin Account" : "My Account") : "Sign In"}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {isAdmin && (
                  <span className="nav-badge nav-badge--admin" title="Admin Access">★</span>
                )}
              </button>

              {user && showAccountNotice && (
                <div className="account-popup" onClick={() => setShowAccountNotice(false)}>
                  <div className="account-popup-inner" onClick={(e) => e.stopPropagation()}>
                    <div className="account-popup-user-info">
                      <span className="account-popup-avatar">🐾</span>
                      <div>
                        <p className="account-popup-name">{profile?.full_name || user.email?.split("@")[0]}</p>
                        <p className="account-popup-email">{user.email}</p>
                        {isAdmin && <span className="account-popup-role-pill">Administrator</span>}
                      </div>
                    </div>

                    <div className="account-popup-actions">
                      <button
                        type="button"
                        className="account-popup-action-btn"
                        onClick={() => {
                          setShowAccountNotice(false);
                          if (onOpenAccount) onOpenAccount();
                        }}
                      >
                        📦 My Orders & Addresses
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          className="account-popup-action-btn account-popup-action-btn--admin"
                          onClick={() => {
                            setShowAccountNotice(false);
                            if (onOpenAdmin) onOpenAdmin();
                          }}
                        >
                          ⚙️ Admin Management Dashboard
                        </button>
                      )}

                      <button
                        type="button"
                        className="account-popup-action-btn account-popup-action-btn--danger"
                        onClick={() => {
                          setShowAccountNotice(false);
                          signOut();
                        }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA Shop Now */}
            <a href="#products" className="nav-cta-button">
              Shop Now
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
