import { useState, useEffect, useMemo } from "react";
import { products as fallbackProducts } from "../../data/products";
import { productsService } from "../../services/products";
import ProductCard from "../ProductCard/ProductCard";

export default function FeaturedProducts({ activeFilter, onFilterChange }) {
  const [localCategory, setLocalCategory] = useState("all");
  const [productsList, setProductsList] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        setLoading(true);
        const { data, error } = await productsService.getProducts({ activeOnly: true });
        if (!error && data && data.length > 0 && isMounted) {
          setProductsList(data);
        }
      } catch (err) {
        console.warn("Live catalog fetch failed, staying on static catalog:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  const filterToUse = activeFilter || localCategory;

  const handleTabClick = (tab) => {
    setLocalCategory(tab);
    if (onFilterChange) {
      onFilterChange(tab);
    }
  };

  const filteredProducts = useMemo(() => {
    if (filterToUse === "all") return productsList;
    if (filterToUse === "dog") return productsList.filter((p) => p.petType === "dog" || p.petType === "both");
    if (filterToUse === "cat") return productsList.filter((p) => p.petType === "cat" || p.petType === "both");
    return productsList.filter((p) => p.category === filterToUse);
  }, [filterToUse, productsList]);

  const tabs = [
    { id: "all", label: "All Favorites" },
    { id: "dog", label: "🐶 Dogs" },
    { id: "cat", label: "🐱 Cats" },
    { id: "food-treats", label: "Food & Treats" },
    { id: "toys", label: "Toys" },
    { id: "grooming", label: "Grooming" },
    { id: "health-wellness", label: "Wellness" }
  ];

  return (
    <section className="jivvi-featured-section" id="products">
      <div className="featured-container">
        <div className="section-head text-center">
          <span className="section-eyebrow">OUR CURATED CATALOG</span>
          <h2 className="section-title">Pet Favorites</h2>
          <p className="section-subtitle">
            Wholesome recipes, vet-formulated supplements, and durable play essentials trusted by happy pet parents.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="featured-tabs-wrapper">
          <div className="featured-tabs-scroll" role="tablist" aria-label="Product categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={filterToUse === tab.id}
                className={`filter-tab-pill ${filterToUse === tab.id ? "filter-tab-pill--active" : ""}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="products-empty-state">
            <p>No products found under this category filter.</p>
            <button
              className="secondary-button"
              onClick={() => handleTabClick("all")}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Guarantee Footer Strip */}
        <div className="products-guarantee-strip">
          <div className="guarantee-item">
            <span className="guarantee-icon">🛡️</span>
            <span>100% Non-Toxic & Safety Verified</span>
          </div>
          <div className="guarantee-item">
            <span className="guarantee-icon">⚡</span>
            <span>Same-Day Bengaluru Dispatch</span>
          </div>
          <div className="guarantee-item">
            <span className="guarantee-icon">🔄</span>
            <span>Hassle-Free 7-Day Returns</span>
          </div>
        </div>
      </div>
    </section>
  );
}
