import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

export default function WishlistDrawer() {
  const { wishlist, isOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    addToast(`Moved "${product.name}" to cart!`, "success");
    closeWishlist();
    openCart();
  };

  return (
    <div className="drawer-overlay" onClick={closeWishlist}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()} aria-label="Saved Wishlist">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3 className="drawer-title">Saved Favorites</h3>
            <span className="drawer-count">({wishlist.length} {wishlist.length === 1 ? "item" : "items"})</span>
          </div>
          <button className="drawer-close-btn" onClick={closeWishlist} aria-label="Close wishlist">
            ✕
          </button>
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="drawer-empty">
            <div className="drawer-empty-icon">❤️</div>
            <h4>Your wishlist is empty</h4>
            <p>Tap the heart icon on any pet product to save it here for later.</p>
            <a
              href="#products"
              className="primary-button drawer-empty-btn"
              onClick={closeWishlist}
            >
              Discover Favorites
            </a>
          </div>
        ) : (
          <div className="drawer-items-list">
            {wishlist.map((product) => (
              <div key={product.id} className="cart-item">
                <div className="cart-item-visual">
                  <span className="cart-item-emoji">
                    {product.petType === "dog" ? "🐶" : product.petType === "cat" ? "🐱" : "🐾"}
                  </span>
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-head">
                    <h4 className="cart-item-title">{product.name}</h4>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="wishlist-item-meta">
                    <span className="cart-item-badge">{product.badge}</span>
                    <span className="wishlist-item-price">₹{product.price.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    className="wishlist-move-btn"
                    onClick={() => handleMoveToCart(product)}
                  >
                    Move to Cart 🐾
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
