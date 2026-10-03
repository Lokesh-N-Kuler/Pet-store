export default function Benefits() {
  const benefitsList = [
    {
      id: "quality",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: "Quality Products",
      desc: "Wholesome ingredients & rigorously tested durable toys for daily joy."
    },
    {
      id: "pet-friendly",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      title: "Pet-Friendly",
      desc: "100% non-toxic, hypoallergenic, and formulated exclusively for pet well-being."
    },
    {
      id: "fast-delivery",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: "Fast Delivery",
      desc: "Swift same-day & next-day doorstep fulfillment starting in Bengaluru."
    },
    {
      id: "trusted-care",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "Trusted Care",
      desc: "Real pet experts available via WhatsApp for sizing, diet, and care advice."
    }
  ];

  return (
    <section className="jivvi-benefits-section" aria-label="Why Shop at JIVVI">
      <div className="benefits-container">
        <div className="benefits-grid">
          {benefitsList.map((item) => (
            <div key={item.id} className="benefit-card">
              <div className="benefit-icon-box">
                {item.icon}
              </div>
              <div className="benefit-text">
                <h3 className="benefit-title">{item.title}</h3>
                <p className="benefit-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
