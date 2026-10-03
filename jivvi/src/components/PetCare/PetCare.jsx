export default function PetCare() {
  return (
    <section className="jivvi-pet-care" id="pet-care">
      <div className="pet-care-container">
        {/* Left Visual Column */}
        <div className="pet-care-visual">
          <div className="pet-care-image-frame">
            <img
              src="/images/care.jpg"
              alt="JIVVI pet care store with healthy puppies and kittens playing"
              className="pet-care-img"
              loading="lazy"
            />
            <div className="pet-care-badge-overlay">
              <span className="care-badge-star">★</span>
              <div>
                <strong>Holistic Well-being</strong>
                <small>From puppyhood to golden years</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="pet-care-content">
          <span className="section-eyebrow">CARE BEYOND COMMERCE</span>

          <h2 className="section-title">
            More Than Shopping.
            <br />
            <span className="title-accent">It's Pet Care.</span>
          </h2>

          <p className="pet-care-lead">
            Because every little life deserves thoughtful, wholesome care. At JIVVI, we believe that true pet care extends far beyond just buying supplies—it is about nurturing a joyful, healthy life for your furry family members.
          </p>

          <div className="care-features-list">
            <div className="care-feature-row">
              <div className="care-feature-icon">🌿</div>
              <div className="care-feature-text">
                <h4>Wholesome, Clean Ingredients</h4>
                <p>No artificial fillers, no harmful preservatives. Only clean proteins, real veggies, and bio-available vitamins.</p>
              </div>
            </div>

            <div className="care-feature-row">
              <div className="care-feature-icon">🩺</div>
              <div className="care-feature-text">
                <h4>Preventive Health & Coat Care</h4>
                <p>Gentle tear-free grooming formulas and omega-rich supplements that maintain vitality and soothe sensitive skin.</p>
              </div>
            </div>

            <div className="care-feature-row">
              <div className="care-feature-icon">💬</div>
              <div className="care-feature-text">
                <h4>Friendly Sizing & Diet Consultation</h4>
                <p>Not sure which kibble or harness fits best? Connect directly with our caring pet advisors on WhatsApp anytime.</p>
              </div>
            </div>
          </div>

          <div className="care-action-row">
            <a href="#products" className="primary-button pet-care-button">
              Explore Pet Care
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </a>

            <a
              href="https://wa.me/919886193296?text=Hi%20JIVVI,%20I'd%20love%20some%20advice%20on%20pet%20care%20products"
              target="_blank"
              rel="noreferrer"
              className="care-consult-link"
            >
              Ask Our Pet Specialist →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
