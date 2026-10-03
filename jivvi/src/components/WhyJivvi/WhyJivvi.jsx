export default function WhyJivvi() {
  const pillars = [
    {
      id: "thoughtfully-selected",
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: "Thoughtfully Selected",
      description: "Every formula, treat, toy, and grooming tool is hand-screened for clean ingredients, safety, and real-world durability."
    },
    {
      id: "easy-shopping",
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: "Easy Shopping",
      description: "No cluttered endless aisles or confusing labels. Clean categories, instant search, and transparent sizing guides."
    },
    {
      id: "pet-first",
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      title: "Pet First",
      description: "We prioritize your pet's physical comfort, joy, and longevity over commercial fads or cheap filler ingredients."
    },
    {
      id: "made-for-pet-parents",
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Made for Pet Parents",
      description: "Crafted by dedicated pet owners in Bengaluru who understand the daily triumphs and worries of raising a happy companion."
    }
  ];

  return (
    <section className="jivvi-why-section" id="about">
      <div className="why-container">
        <div className="section-head text-center">
          <span className="section-eyebrow">OUR CORE COMMITMENT</span>
          <h2 className="section-title">Why Choose JIVVI</h2>
          <p className="section-subtitle">
            We are reimagining pet retail with genuine warmth, rigorous quality standards, and honest service.
          </p>
        </div>

        <div className="why-grid">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="why-card">
              <div className="why-icon-box">
                {pillar.icon}
              </div>
              <h3 className="why-card-title">{pillar.title}</h3>
              <p className="why-card-desc">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
