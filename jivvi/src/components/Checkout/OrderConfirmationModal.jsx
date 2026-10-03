// ==============================================================================
// ORDER CONFIRMATION MODAL
// File: src/components/Checkout/OrderConfirmationModal.jsx
// ==============================================================================

export default function OrderConfirmationModal({ orderDetails, onClose, onOpenOrders }) {
  if (!orderDetails) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="jivvi-order-confirmed-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Confetti / Paw Icon */}
        <div className="confirmed-icon-circle">
          🎉
        </div>

        <h3 className="confirmed-title">Order Confirmed! 🐾</h3>
        <p className="confirmed-subtitle">
          Thank you, <strong>{orderDetails.customerName || "Pet Parent"}</strong>! Your companion's essentials are being packed with care.
        </p>

        {/* Order Details Receipt Card */}
        <div className="confirmed-receipt-box">
          <div className="receipt-row">
            <span className="receipt-label">Order Number</span>
            <span className="receipt-order-number">{orderDetails.orderNumber}</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Payment Status</span>
            <span className="receipt-paid-pill">✓ Paid via Razorpay</span>
          </div>

          <div className="receipt-row">
            <span className="receipt-label">Total Amount Paid</span>
            <strong className="receipt-amount">₹{Number(orderDetails.totalAmount).toLocaleString("en-IN")}</strong>
          </div>

          <div className="receipt-row receipt-address-row">
            <span className="receipt-label">Delivery Destination</span>
            <span className="receipt-address">{orderDetails.shippingAddress}</span>
          </div>
        </div>

        {/* Shipping Timeline Banner */}
        <div className="confirmed-shipping-note">
          <span className="truck-icon">🚚</span>
          <div>
            <strong>Expected Delivery: Tomorrow by 2:00 PM</strong>
            <p>Our Bengaluru team will send live dispatch and WhatsApp delivery tracking alerts.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmed-actions">
          {onOpenOrders && (
            <button
              type="button"
              className="primary-button confirmed-track-btn"
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
            >
              Track Order Status
            </button>
          )}

          <button
            type="button"
            className="secondary-button confirmed-continue-btn"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
