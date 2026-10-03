import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      addToast("Please enter a valid email address.", "info");
      return;
    }

    setIsSubmitted(true);
    addToast("🎉 You're subscribed to JIVVI Pet Care updates!", "success");
    setEmail("");
  };

  return (
    <section className="jivvi-newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-card">
          <div className="newsletter-icon-wrap">
            <span className="newsletter-emoji">📬</span>
          </div>

          <h2 className="newsletter-title">Stay in the Loop</h2>

          <p className="newsletter-text">
            Get helpful pet-care tips, new arrivals and special offers from JIVVI delivered straight to your inbox.
          </p>

          {isSubmitted ? (
            <div className="newsletter-success-box">
              <span className="success-check">✓</span>
              <div>
                <strong>Thank you for subscribing!</strong>
                <p>Check your inbox soon for your special welcome discount code.</p>
              </div>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  aria-label="Enter your email"
                  className="newsletter-input"
                />
                <button type="submit" className="primary-button newsletter-submit-btn">
                  Subscribe
                </button>
              </div>
              <p className="newsletter-disclaimer">
                🔒 We respect your privacy. No spam, only genuine pet-care love. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
