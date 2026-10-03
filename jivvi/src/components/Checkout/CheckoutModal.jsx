// ==============================================================================
// CHECKOUT MODAL COMPONENT (Razorpay Integration)
// File: src/components/Checkout/CheckoutModal.jsx
// ==============================================================================

import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { profileService } from "../../services/profile";
import { couponsService } from "../../services/coupons";
import { paymentsService } from "../../services/payments";

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  // Address State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    area: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  });

  // Coupon & Calculation State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Checkout Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatusText, setCheckoutStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved addresses when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        profileService.getAddresses(user.id).then((addrs) => {
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData({
              fullName: defaultAddr.full_name,
              phone: defaultAddr.phone,
              addressLine1: defaultAddr.address_line_1,
              area: defaultAddr.area,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            });
          }
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          fullName: profile?.full_name || "",
          phone: profile?.phone || "",
        }));
      }
    }
  }, [isOpen, user, profile]);

  if (!isOpen) return null;

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData({
      fullName: addr.full_name,
      phone: addr.phone,
      addressLine1: addr.address_line_1,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      const result = await couponsService.evaluateCoupon(couponInput, subtotal, user?.id);
      if (result.valid) {
        setAppliedCoupon({
          code: couponInput.toUpperCase(),
          discount: result.discountAmount,
        });
        addToast(result.message || "Coupon applied!", "success");
      } else {
        setCouponError(result.message);
      }
    } catch {
      setCouponError("Could not validate coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryFee = subtotal >= 999 ? 0 : 79;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handlePayNow = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || !formData.pincode.trim()) {
      setErrorMessage("Please complete all required shipping fields.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);
    setCheckoutStatusText("Calculating verified total & preparing order...");

    try {
      // 1. Create order on server / Edge Function
      const orderPayload = {
        shippingName: formData.fullName,
        shippingPhone: formData.phone,
        shippingAddress: formData.addressLine1,
        shippingArea: formData.area || "Bengaluru",
        shippingCity: formData.city,
        shippingState: formData.state,
        shippingPincode: formData.pincode,
        couponCode: appliedCoupon?.code,
        items: items.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
      };

      const orderData = await paymentsService.createRazorpayOrder(orderPayload);
      setCheckoutStatusText("Opening Razorpay payment gateway...");

      // 2. Open Razorpay Checkout modal
      await paymentsService.openCheckout({
        orderData,
        customer: {
          name: formData.fullName,
          email: user?.email || "customer@jivvi.in",
          phone: formData.phone,
        },
        onSuccess: (verificationResult) => {
          setCheckoutStatusText("Payment verified successfully! 🎉");
          clearCart();
          onClose();
          if (onOrderSuccess) {
            onOrderSuccess({
              orderNumber: verificationResult.order_number || orderData.order_number,
              totalAmount: finalTotal,
              shippingAddress: `${formData.addressLine1}, ${formData.area}, ${formData.city} - ${formData.pincode}`,
              customerName: formData.fullName,
            });
          }
        },
        onFailure: (err) => {
          console.error("Payment failed or cancelled:", err);
          setIsProcessing(false);
          setErrorMessage(err.description || err.message || "Payment was not completed. Please try again.");
        },
        onDismiss: () => {
          setIsProcessing(false);
          setCheckoutStatusText("");
        },
      });
    } catch (err) {
      console.error("Checkout initiation error:", err);
      setIsProcessing(false);
      setErrorMessage(err.message || "Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="jivvi-checkout-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="checkout-modal-header">
          <div className="checkout-title-wrap">
            <h3 className="checkout-title">Express Checkout</h3>
            <span className="checkout-badge-secure">🔒 256-Bit SSL Encrypted</span>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close checkout">
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="checkout-modal-grid">
          {/* Left Column: Delivery Address */}
          <div className="checkout-left-col">
            <h4 className="checkout-section-title">📍 Bengaluru Delivery Address</h4>

            {savedAddresses.length > 0 && (
              <div className="saved-addresses-list">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`saved-address-card ${selectedAddressId === addr.id ? "saved-address-card--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="selected_address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => handleAddressSelect(addr)}
                    />
                    <div className="address-card-info">
                      <strong>{addr.full_name}</strong> • {addr.phone}
                      <p>{addr.address_line_1}, {addr.area}, {addr.city} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  className="add-new-address-btn"
                  onClick={() => {
                    setSelectedAddressId("new");
                    setFormData({
                      fullName: "",
                      phone: "",
                      addressLine1: "",
                      area: "",
                      city: "Bengaluru",
                      state: "Karnataka",
                      pincode: "",
                    });
                  }}
                >
                  + Enter a different address
                </button>
              </div>
            )}

            {(savedAddresses.length === 0 || selectedAddressId === "new") && (
              <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-row-2">
                  <div className="auth-input-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyadarshini M."
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98860 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Flat / House / Building / Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. #14, 2nd Cross, Indiranagar"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="auth-input-group">
                    <label>Area / Landmark</label>
                    <input
                      type="text"
                      placeholder="Near 100ft Road"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Pincode (Bengaluru) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560038"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            )}

            <div className="checkout-express-banner">
              <span className="express-bolt">⚡</span>
              <div>
                <strong>Same-Day Bengaluru Express Dispatch</strong>
                <p>Orders confirmed before 2:00 PM are dispatched same-day with temperature-safe packing.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="checkout-right-col">
            <h4 className="checkout-section-title">Order Summary ({items.length} items)</h4>

            <div className="checkout-items-preview">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="checkout-preview-item">
                  <div className="checkout-item-title-wrap">
                    <span className="checkout-item-name">{product.name}</span>
                    <span className="checkout-item-qty">Qty: {quantity}</span>
                  </div>
                  <span className="checkout-item-price">₹{(product.price * quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="checkout-coupon-box">
              {appliedCoupon ? (
                <div className="applied-coupon-pill">
                  <span>🎉 <strong>{appliedCoupon.code}</strong> (-₹{appliedCoupon.discount})</span>
                  <button type="button" onClick={handleRemoveCoupon} aria-label="Remove coupon">✕</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-input-form">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" disabled={isApplyingCoupon}>
                    {isApplyingCoupon ? "..." : "Apply"}
                  </button>
                </form>
              )}
              {couponError && <p className="coupon-error-msg">{couponError}</p>}
            </div>

            {/* Price Breakdown */}
            <div className="checkout-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="breakdown-row discount-row">
                  <span>Promotional Discount</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Bengaluru Express Delivery</span>
                <span>{deliveryFee === 0 ? <span className="free-tag">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              <div className="breakdown-row total-row">
                <span>Total Amount</span>
                <span className="checkout-total-number">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              type="button"
              className="primary-button checkout-pay-btn"
              onClick={handlePayNow}
              disabled={isProcessing}
            >
              {isProcessing ? checkoutStatusText : `Pay ₹${finalTotal.toLocaleString("en-IN")} with Razorpay 🔒`}
            </button>

            <div className="checkout-payment-logos">
              <span>Accepted:</span>
              <span className="pay-badge">UPI</span>
              <span className="pay-badge">GPay</span>
              <span className="pay-badge">PhonePe</span>
              <span className="pay-badge">Cards</span>
              <span className="pay-badge">NetBanking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
