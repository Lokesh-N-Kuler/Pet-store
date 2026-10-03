export default function PetCategories({ onSelectSpecies }) {
  const handleSelect = (species) => {
    if (onSelectSpecies) {
      onSelectSpecies(species);
    }
  };

  return (
    <section className="jivvi-pet-hub" id="shop-pet">
      <div className="pet-hub-container">
        <div className="section-head text-center">
          <span className="section-eyebrow">SHOP BY PET</span>
          <h2 className="section-title">Shop for Your Best Friend</h2>
          <p className="section-subtitle">
            Tailored nutrition, playful toys, and everyday comfort essentials designed specifically for canine and feline needs.
          </p>
        </div>

        <div className="pet-cards-grid">
          {/* Dogs Card */}
          <div className="pet-card pet-card--dog">
            <div className="pet-card-media">
              <img
                src="/images/dogs.jpg"
                alt="Happy dog - JIVVI Dog Essentials"
                className="pet-card-img"
                loading="lazy"
              />
              <span className="pet-card-tag">Canine Essentials</span>
            </div>
            <div className="pet-card-body">
              <h3 className="pet-card-title">Dogs</h3>
              <p className="pet-card-tagline">Caring for every wag.</p>
              <p className="pet-card-description">
                High-protein nutrition, long-lasting chew toys, ergonomic walking gear, and coat wellness for puppies to seniors.
              </p>
              <a
                href="#products"
                className="pet-card-cta"
                onClick={() => handleSelect("dog")}
              >
                <span>Shop Dogs</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>

          {/* Cats Card */}
          <div className="pet-card pet-card--cat">
            <div className="pet-card-media">
              <img
                src="/images/cats.jpg"
                alt="Curious cat - JIVVI Cat Essentials"
                className="pet-card-img"
                loading="lazy"
              />
              <span className="pet-card-tag">Feline Essentials</span>
            </div>
            <div className="pet-card-body">
              <h3 className="pet-card-title">Cats</h3>
              <p className="pet-card-tagline">Everything for curious companions.</p>
              <p className="pet-card-description">
                Gourmet lickable purees, feather teaser wands, felted wool caves, and gentle de-shedding tools cats truly enjoy.
              </p>
              <a
                href="#products"
                className="pet-card-cta"
                onClick={() => handleSelect("cat")}
              >
                <span>Shop Cats</span>
                <span className="cta-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
