// ==============================================================================
// AUTH MODAL COMPONENT
// File: src/components/Auth/AuthModal.jsx
// ==============================================================================

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, signIn, signUp, resetPassword } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (authModalMode === "signin") {
        await signIn(email, password);
        addToast("Welcome back to JIVVI! 🐾", "success");
      } else if (authModalMode === "signup") {
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        await signUp({ email, password, fullName, phone });
        addToast("Account created successfully! Welcome to JIVVI.", "success");
      } else if (authModalMode === "forgot") {
        await resetPassword(email);
        addToast("Password reset instructions sent to your email.", "info");
        setAuthModalMode("signin");
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={closeAuthModal}>
      <div className="jivvi-auth-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="auth-close-btn" onClick={closeAuthModal} aria-label="Close dialog">
          ✕
        </button>

        {/* Brand Header */}
        <div className="auth-header">
          <img src="/images/logo.jpg" alt="JIVVI" className="auth-logo" />
          <h3 className="auth-title">
            {authModalMode === "signin" && "Welcome Back"}
            {authModalMode === "signup" && "Join the JIVVI Family"}
            {authModalMode === "forgot" && "Reset Password"}
          </h3>
          <p className="auth-subtitle">
            {authModalMode === "signin" && "Sign in to access your orders, pet profiles, and saved items."}
            {authModalMode === "signup" && "Create an account for personalized care and faster checkout."}
            {authModalMode === "forgot" && "Enter your email to receive recovery instructions."}
          </p>
        </div>

        {/* Mode Tabs */}
        {authModalMode !== "forgot" && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authModalMode === "signin"}
              className={`auth-tab ${authModalMode === "signin" ? "auth-tab--active" : ""}`}
              onClick={() => { setAuthModalMode("signin"); setErrorMsg(""); }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authModalMode === "signup"}
              className={`auth-tab ${authModalMode === "signup" ? "auth-tab--active" : ""}`}
              onClick={() => { setAuthModalMode("signup"); setErrorMsg(""); }}
            >
              Create Account
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {authModalMode === "signup" && (
            <>
              <div className="auth-input-group">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Narayana"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label htmlFor="auth-phone">Phone Number (Optional)</label>
                <input
                  id="auth-phone"
                  type="tel"
                  placeholder="+91 98860 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {authModalMode !== "forgot" && (
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Password</label>
                {authModalMode === "signin" && (
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => { setAuthModalMode("forgot"); setErrorMsg(""); }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="primary-button auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : authModalMode === "signin" ? "Sign In 🐾" : authModalMode === "signup" ? "Create Account 🐾" : "Send Reset Link"}
          </button>
        </form>

        {authModalMode === "forgot" && (
          <div className="auth-footer-nav">
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => { setAuthModalMode("signin"); setErrorMsg(""); }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        <div className="auth-footer-guarantee">
          🔒 Secure 256-bit encrypted authentication powered by Supabase.
        </div>
      </div>
    </div>
  );
}
