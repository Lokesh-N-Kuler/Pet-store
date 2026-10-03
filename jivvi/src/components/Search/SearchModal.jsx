import { useState, useEffect, useMemo } from "react";
import { products } from "../../data/products";
import { productsService } from "../../services/products";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [liveResults, setLiveResults] = useState(null);
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setLiveResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await productsService.searchProducts(query);
        if (!error && data && data.length > 0) {
          setLiveResults(data);
        } else {
          setLiveResults(null);
        }
      } catch (err) {
        setLiveResults(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    if (liveResults && liveResults.length > 0) return liveResults;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.petType.toLowerCase().includes(q)
    );
  }, [query, liveResults]);

  if (!isOpen) return null;

  const handleAdd = (product) => {
    addToCart(product, 1);
    addToast(`Added "${product.name}" to cart!`, "success");
    onClose();
    openCart();
  };

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <svg className="search-input-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              autoFocus
              placeholder="Search food, treats, toys, care, harness..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-modal-input"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button className="search-modal-close" onClick={onClose} aria-label="Close search">
            ✕
          </button>
        </div>

        <div className="search-modal-body">
          {query.trim() === "" ? (
            <div className="search-popular-tags">
              <p className="search-popular-title">Popular searches:</p>
              <div className="search-tags-row">
                {["Salmon Dog Food", "Tuna Puree Treats", "Dental Chew Bone", "Soothing Shampoo", "Memory Foam Bed", "No-Pull Harness"].map((tag) => (
                  <button
                    key={tag}
                    className="search-tag-chip"
                    onClick={() => setQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="search-no-results">
              <p className="search-no-title">No products found for "{query}"</p>
              <p className="search-no-subtitle">Try searching for "dog", "cat", "treat", "shampoo", or "toy".</p>
            </div>
          ) : (
            <div className="search-results-list">
              <p className="search-results-count">Found {results.length} result{results.length > 1 ? "s" : ""}:</p>
              {results.map((product) => (
                <div key={product.id} className="search-result-item">
                  <div className="search-result-info">
                    <span className="search-result-category">{product.petType.toUpperCase()} • {product.badge}</span>
                    <h4 className="search-result-name">{product.name}</h4>
                    <span className="search-result-price">₹{product.price.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    className="search-add-btn"
                    onClick={() => handleAdd(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
