export default function Footer() {
  const whatsappNumber = "919886193296";

  return (
    <footer className="jivvi-footer" id="contact">
      {/* WhatsApp Help Banner */}
      <div className="footer-concierge-strip">
        <div className="concierge-container">
          <div className="concierge-content">
            <span className="concierge-badge">PERSONALIZED CARE</span>
            <h3 className="concierge-title">Need personalized pet care advice?</h3>
            <p className="concierge-desc">
              Have a question about food sensitivity, sizing, or daily care routines? Our Bengaluru pet team is just a message away.
            </p>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber}?text=Hi%20JIVVI,%20I%20have%20a%20question%20about%20my%20pet`}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-concierge-button"
          >
            <span className="wa-icon">💬</span>
            <span>Chat with us on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand Info */}
          <div className="footer-brand-column">
            <a href="#home" className="footer-logo-link">
              <img
                src="/images/logo.jpg"
                alt="JIVVI Logo"
                className="footer-logo-img"
              />
            </a>
            <p className="footer-brand-desc">
              Thoughtful pet-care essentials, clean nutrition, and engaging toys crafted for every little life. Starting local express delivery in Bengaluru.
            </p>
            <div className="footer-location-chip">
              <span>📍 Bengaluru, Karnataka, India</span>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="footer-nav-column">
            <h4 className="footer-column-heading">Shop</h4>
            <ul className="footer-links-list">
              <li><a href="#shop-pet">Dogs</a></li>
              <li><a href="#shop-pet">Cats</a></li>
              <li><a href="#products">Food & Treats</a></li>
              <li><a href="#products">Toys</a></li>
              <li><a href="#products">Grooming</a></li>
              <li><a href="#products">Accessories</a></li>
            </ul>
          </div>

          {/* Column 2: Support */}
          <div className="footer-nav-column">
            <h4 className="footer-column-heading">Support</h4>
            <ul className="footer-links-list">
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#contact">FAQs</a></li>
              <li><a href="#contact">Shipping & Delivery</a></li>
              <li><a href="#contact">Returns & Refunds</a></li>
              <li><a href="#contact">Privacy Policy</a></li>
              <li><a href="#contact">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-nav-column">
            <h4 className="footer-column-heading">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about">About JIVVI</a></li>
              <li><a href="#pet-care">Pet Care Philosophy</a></li>
              <li><a href="#about">Our Story</a></li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="footer-nav-column">
            <h4 className="footer-column-heading">Connect</h4>
            <div className="footer-social-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <span>📷</span> Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <span>📘</span> Facebook
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="social-link"
                aria-label="YouTube"
              >
                <span>▶️</span> YouTube
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p>© 2026 JIVVI. All rights reserved.</p>
          <p className="footer-credit">Handcrafted with care for happy pets and happier pet parents.</p>
        </div>
      </div>
    </footer>
  );
}
