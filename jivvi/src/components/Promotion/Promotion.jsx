export default function Promotion({ onExploreOffers }) {
  const handleExplore = () => {
    if (onExploreOffers) {
      onExploreOffers();
    }
  };

  return (
    <section className="jivvi-promo-section" id="offers">
      <div className="promo-container">
        <div className="promo-card">
          {/* Content Column */}
          <div className="promo-content">
            <div className="promo-badge-tag">
              <span className="promo-badge-sparkle">✨</span>
              <span className="promo-badge-text">LIMITED TIME SAVINGS</span>
            </div>

            <h2 className="promo-title">
              Something Special
              <br />
              <span className="promo-title-highlight">for Your Pet</span>
            </h2>

            <p className="promo-description">
              Discover selected favorites and seasonal offers. Save up to 25% on our premium organic foods, durable enrichment toys, and orthopedic comfort beds this week.
            </p>

            <div className="promo-perks">
              <div className="promo-perk-item">
                <span className="perk-check">✓</span>
                <span>Use code <strong>BENGALURU10</strong> for extra ₹100 off</span>
              </div>
              <div className="promo-perk-item">
                <span className="perk-check">✓</span>
                <span>Free doorstep delivery on orders above ₹999</span>
              </div>
            </div>

            <div className="promo-actions">
              <a
                href="#products"
                className="promo-primary-btn"
                onClick={handleExplore}
              >
                Explore Offers
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </a>

              <span className="promo-guarantee-note">
                🐾 No minimum order requirement
              </span>
            </div>
          </div>

          {/* Media Column */}
          <div className="promo-media">
            <div className="promo-image-wrapper">
              <img
                src="/images/section.jpg"
                alt="JIVVI companions - Happy dog and cat side by side outdoors"
                className="promo-banner-img"
                loading="lazy"
              />
              <div className="promo-floating-tag">
                <span className="tag-save-percent">UP TO 25% OFF</span>
                <span className="tag-save-sub">Selected Bundles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
