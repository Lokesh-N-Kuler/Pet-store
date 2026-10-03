import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import Rating from "../common/Rating";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    setIsAdding(true);
    addToCart(product, 1);
    addToast(`Added "${product.name}" to cart! 🐾`, "success");

    setTimeout(() => {
      setIsAdding(false);
    }, 400);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    if (!isFavorited) {
      addToast(`Saved "${product.name}" to your wishlist! ❤️`, "heart");
    } else {
      addToast(`Removed "${product.name}" from wishlist`, "info");
    }
  };

  const getProductVisualEmoji = () => {
    switch (product.iconType) {
      case "food":
        return "🥣";
      case "treat":
        return "🐟";
      case "bone":
        return "🦴";
      case "wand":
        return "🪶";
      case "shampoo":
        return "🧴";
      case "brush":
        return "🪮";
      case "bed":
        return "🛋️";
      case "igloo":
        return "🛖";
      case "drops":
        return "💧";
      case "chews":
        return "💊";
      case "harness":
        return "🦺";
      case "bowl":
        return "🍲";
      default:
        return "🐾";
    }
  };

  return (
    <article className="product-card">
      {/* Media Canvas */}
      <div className="product-card-media">
        {/* Discount Badge */}
        {product.discount && (
          <span className="product-discount-badge">
            {product.discount}
          </span>
        )}

        {/* Feature Tag */}
        {product.badge && (
          <span className="product-feature-tag">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          className={`product-wishlist-btn ${isFavorited ? "product-wishlist-btn--active" : ""}`}
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill={isFavorited ? "#FF5252" : "none"} stroke={isFavorited ? "#FF5252" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Visual Graphic Representation */}
        <div className="product-card-visual-box">
          <div className="product-visual-circle">
            <span className="product-visual-emoji">{getProductVisualEmoji()}</span>
          </div>
          <span className="product-species-pill">
            {product.petType === "dog" ? "🐶 Dog" : product.petType === "cat" ? "🐱 Cat" : "🐶🐱 Dog & Cat"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="product-card-body">
        <div className="product-card-meta">
          <Rating value={product.rating} count={product.reviewsCount} />
          {product.weight && <span className="product-size-label">{product.weight}</span>}
          {product.size && <span className="product-size-label">{product.size}</span>}
        </div>

        <h3 className="product-card-title" title={product.name}>
          {product.name}
        </h3>

        <p className="product-card-desc">
          {product.shortDesc}
        </p>

        <div className="product-card-pricing-row">
          <div className="product-prices">
            <span className="product-current-price">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className="product-mrp-price">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>

          <button
            type="button"
            className={`product-add-cart-btn ${isAdding ? "product-add-cart-btn--added" : ""}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <span className="cart-btn-icon">
              {isAdding ? "✓" : "+"}
            </span>
            <span>{isAdding ? "Added!" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
