function Hero() {
  return (
    <section className="hero" id="home">

      <div className="hero-content">

        <p className="hero-small">
          JIVVI
        </p>

        <h1>
          For Every
          <br />
          Little Life.
        </h1>

        <p className="hero-description">
          Everything your dog or cat needs — food,
          treats, care and accessories, delivered
          with love.
        </p>

        <p className="location">
          Starting in Bengaluru
        </p>

        <a
          href="#products"
          className="primary-button"
        >
          SHOP NOW
        </a>

      </div>

      <div className="hero-image">
        <img
          src="/images/hero.jpg"
          alt="Pet"
        />
      </div>

    </section>
  );
}

export default Hero;