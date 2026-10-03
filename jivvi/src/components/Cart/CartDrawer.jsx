import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer({ onOpenCheckout }) {
  const { items, isOpen, closeCart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const freeShippingDiff = FREE_SHIPPING_THRESHOLD - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckout = () => {
    closeCart();
    if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      addToast("Opening secure checkout...", "info");
    }
  };

  return (
    <div className="drawer-overlay" onClick={closeCart}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()} aria-label="Shopping Cart">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3 className="drawer-title">Shopping Cart</h3>
            <span className="drawer-count">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
          </div>
          <button className="drawer-close-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="cart-shipping-bar">
          <div className="cart-shipping-text">
            {freeShippingDiff > 0 ? (
              <>Add <strong>₹{freeShippingDiff.toLocaleString("en-IN")}</strong> more for <strong>FREE Bengaluru Delivery</strong></>
            ) : (
              <>🎉 You've unlocked <strong>FREE Bengaluru Express Delivery</strong>!</>
            )}
          </div>
          <div className="cart-progress-track">
            <div
              className="cart-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="drawer-empty">
            <div className="drawer-empty-icon">🐾</div>
            <h4>Your cart is empty</h4>
            <p>Looks like you haven't added any pet favorites yet. Explore our curated food, treats, and toys!</p>
            <a
              href="#products"
              className="primary-button drawer-empty-btn"
              onClick={closeCart}
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="drawer-items-list">
              {items.map(({ product, quantity }) => (
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
                        onClick={() => removeFromCart(product.id)}
                        aria-label={`Remove ${product.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    <span className="cart-item-badge">{product.badge}</span>
                    <div className="cart-item-pricing-row">
                      <div className="cart-item-qty-control">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-item-subtotal">
                        ₹{(product.price * quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="drawer-footer">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>
              <div className="cart-summary-row">
                <span>Delivery (Bengaluru)</span>
                <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? <span className="free-tag">FREE</span> : "₹79"}</span>
              </div>
              <div className="cart-summary-row cart-total-row">
                <span>Estimated Total</span>
                <span className="cart-total-amount">
                  ₹{(subtotal >= FREE_SHIPPING_THRESHOLD ? subtotal : subtotal + 79).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                className="primary-button cart-checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <p className="cart-reassurance">
                🔒 Safe & secure checkout. 100% pet-friendly guarantee.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
