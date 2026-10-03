export default function Rating({ value = 5, count = null }) {
  const rounded = Math.round(value);
  return (
    <div className="jivvi-rating" aria-label={`Rating: ${value} out of 5 stars`}>
      <div className="jivvi-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`jivvi-star ${star <= rounded ? "jivvi-star--filled" : "jivvi-star--empty"}`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="jivvi-rating-val">{value.toFixed(1)}</span>
      {count !== null && (
        <span className="jivvi-rating-count">({count})</span>
      )}
    </div>
  );
}
