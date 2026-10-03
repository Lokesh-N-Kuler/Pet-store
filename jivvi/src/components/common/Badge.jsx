export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <span className={`jivvi-badge jivvi-badge--${variant} ${className}`}>
      {children}
    </span>
  );
}
