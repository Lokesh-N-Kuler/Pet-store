function About() {
  return (
    <section
      className="about"
      id="about"
    >

      <div className="about-image">
        <img
          src="/images/section.jpg"
          alt="Jivvi pets"
        />
      </div>

      <div className="about-content">

        <p className="section-label">
          ABOUT JIVVI
        </p>

        <h2>
          Pet care,
          <br />
          made simple.
        </h2>

        <p>
          JIVVI is starting with local
          pet-product delivery in Bengaluru.
          We're testing a simple, convenient
          way to get everyday essentials for
          your dog or cat.
        </p>

        <a
          href="#contact"
          className="primary-button"
        >
          SHOP NOW
        </a>

      </div>

    </section>
  );
}

export default About;