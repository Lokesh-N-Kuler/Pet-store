export default function Hero() {
  return (
    <section className="jivvi-hero" id="home">
      <div className="jivvi-hero-container">
        {/* Left Editorial Content */}
        <div className="jivvi-hero-content">
          <div className="hero-pill-badge">
            <span className="hero-pill-dot"></span>
            <span className="hero-pill-text">EVERYTHING YOUR PET DESERVES</span>
          </div>

          <h1 className="hero-headline">
            Happy Pets.
            <br />
            <span className="hero-headline-accent">Happier Pet Parents.</span>
          </h1>

          <p className="hero-subheading">
            Discover trusted products, everyday essentials and thoughtful care for the pets you love. Starting with fast, dependable delivery right to your doorstep in Bengaluru.
          </p>

          <div className="hero-cta-group">
            <a href="#products" className="primary-button hero-cta-primary">
              Shop Now
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </a>

            <a href="#pet-care" className="secondary-button hero-cta-secondary">
              Explore Pet Care
            </a>
          </div>

          {/* Social Proof & Value Snippet */}
          <div className="hero-proof-strip">
            <div className="hero-avatar-stack">
              <span className="proof-avatar proof-avatar--1">🐶</span>
              <span className="proof-avatar proof-avatar--2">🐱</span>
              <span className="proof-avatar proof-avatar--3">🐾</span>
            </div>
            <div className="hero-proof-text">
              <strong>Trusted by 2,500+ pet parents</strong> in Bengaluru for nutrition & gentle care.
            </div>
          </div>
        </div>

        {/* Right Visual Image */}
        <div className="jivvi-hero-visual">
          <div className="hero-image-frame">
            <img
              src="/images/hero.jpg"
              alt="JIVVI Happy Golden Retriever dog and cat sleeping peacefully together"
              className="hero-main-img"
              fetchPriority="high"
              loading="eager"
            />
            <div className="hero-floating-badge hero-floating-badge--left">
              <span className="floating-badge-icon">🌿</span>
              <div className="floating-badge-info">
                <strong>100% Pet-Safe</strong>
                <small>Vet-Approved Formulas</small>
              </div>
            </div>
            <div className="hero-floating-badge hero-floating-badge--right">
              <span className="floating-badge-icon">⚡</span>
              <div className="floating-badge-info">
                <strong>Express Delivery</strong>
                <small>Across Bengaluru</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
