import { categories } from "../../data/categories";

export default function CategoryGrid({ onSelectCategory }) {
  const getCategoryIcon = (icon) => {
    switch (icon) {
      case "paw":
        return "🍖";
      case "toy":
        return "🎾";
      case "bath":
        return "🛁";
      case "bed":
        return "🛋️";
      case "heart":
        return "🩺";
      case "tag":
        return "🦮";
      default:
        return "🐾";
    }
  };

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <section className="jivvi-categories-section" id="categories">
      <div className="categories-container">
        <div className="section-head text-center">
          <span className="section-eyebrow">WHAT THEY NEED</span>
          <h2 className="section-title">Everything They Need</h2>
          <p className="section-subtitle">
            Quality food, gentle care, durable accessories, and comforting spaces for your beloved pets.
          </p>
        </div>

        <div className="category-tiles-grid">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href="#products"
              className="category-tile"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <div className="category-tile-icon-box">
                <span className="category-emoji">{getCategoryIcon(cat.icon)}</span>
              </div>
              <div className="category-tile-content">
                <div className="category-tile-header">
                  <h3 className="category-tile-name">{cat.name}</h3>
                  <span className="category-tile-badge">{cat.badge}</span>
                </div>
                <p className="category-tile-desc">{cat.description}</p>
                <div className="category-tile-footer">
                  <span className="category-count">{cat.itemCount} Essentials</span>
                  <span className="category-explore-link">Explore →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
