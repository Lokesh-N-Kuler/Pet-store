import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function MobileMenu({ isOpen, onClose, onOpenSearch }) {
  const { totalItems, openCart } = useCart();
  const { totalWishlist, openWishlist } = useWishlist();

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <aside className="mobile-menu-panel" onClick={(e) => e.stopPropagation()} aria-label="Mobile Navigation">
        <div className="mobile-menu-head">
          <div className="mobile-brand">
            <img src="/images/logo.jpg" alt="JIVVI" className="mobile-logo-img" />
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close navigation menu">
            ✕
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="mobile-search-trigger" onClick={() => { onClose(); onOpenSearch(); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search products, food, care...</span>
        </div>

        {/* Nav Links */}
        <nav className="mobile-nav-links">
          <a href="#home" onClick={handleLinkClick}>Home</a>
          <a href="#products" onClick={handleLinkClick}>Shop All</a>
          <a href="#shop-pet" onClick={handleLinkClick} className="highlight-tag">Dogs & Cats</a>
          <a href="#categories" onClick={handleLinkClick}>Categories</a>
          <a href="#pet-care" onClick={handleLinkClick}>Pet Care</a>
          <a href="#about" onClick={handleLinkClick}>About Us</a>
          <a href="#contact" onClick={handleLinkClick}>Contact</a>
        </nav>

        {/* Utility Actions */}
        <div className="mobile-quick-actions">
          <button
            className="mobile-action-pill"
            onClick={() => { onClose(); openWishlist(); }}
          >
            <span>❤️ Wishlist</span>
            {totalWishlist > 0 && <span className="action-count-pill">{totalWishlist}</span>}
          </button>

          <button
            className="mobile-action-pill"
            onClick={() => { onClose(); openCart(); }}
          >
            <span>🛍️ Cart</span>
            {totalItems > 0 && <span className="action-count-pill">{totalItems}</span>}
          </button>
        </div>

        <div className="mobile-bottom-cta">
          <a
            href="#products"
            className="primary-button mobile-shop-btn"
            onClick={handleLinkClick}
          >
            Shop Now
          </a>
          <a
            href="https://wa.me/919886193296?text=Hi%20JIVVI,%20I%20have%20a%20question%20about%20my%20pet"
            target="_blank"
            rel="noreferrer"
            className="mobile-whatsapp-btn"
          >
            💬 Chat with Pet Specialist
          </a>
        </div>
      </aside>
    </div>
  );
}
