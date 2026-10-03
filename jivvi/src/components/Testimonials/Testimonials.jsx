import { testimonials } from "../../data/testimonials";
import Rating from "../common/Rating";

export default function Testimonials() {
  return (
    <section className="jivvi-testimonials-section" aria-label="Customer Reviews">
      <div className="testimonials-container">
        <div className="section-head text-center">
          <span className="section-eyebrow">HEARTFELT STORIES</span>
          <h2 className="section-title">Loved by Pet Parents</h2>
          <p className="section-subtitle">
            See how JIVVI's wholesome nutrition, engaging toys, and express doorstep delivery bring joy to homes across Bengaluru.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((review) => (
            <div key={review.id} className="testimonial-card">
              <div className="testimonial-header">
                <Rating value={review.rating} />
                <span className="testimonial-verified-badge">
                  <span className="badge-check">✓</span> Sample Pet Parent
                </span>
              </div>

              <h3 className="testimonial-title">"{review.title}"</h3>

              <p className="testimonial-comment">
                {review.comment}
              </p>

              <div className="testimonial-author-block">
                <div className="author-avatar-circle">
                  {review.author.charAt(0)}
                </div>
                <div className="author-details">
                  <strong className="author-name">{review.author}</strong>
                  <span className="author-pet">{review.pet}</span>
                  <span className="author-location">📍 {review.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
