// ==============================================================================
// CUSTOMER ACCOUNT & ORDER HISTORY MODAL
// File: src/components/Account/AccountModal.jsx manya nayiii
// ==============================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ordersService } from "../../services/orders";
import { profileService } from "../../services/profile";

export default function AccountModal({ isOpen, onClose, onOpenAdmin }) {
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'addresses' | 'profile'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // New Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    area: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
  });

  useEffect(() => {
    if (isOpen) {
      if (profile) {
        setEditName(profile.full_name || "");
        setEditPhone(profile.phone || "");
      }
      loadOrders();
      loadAddresses();
    }
  }, [isOpen, user, profile]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await ordersService.getUserOrders(user?.id);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await profileService.getAddresses(user?.id);
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load customer addresses:", err);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await profileService.updateProfile(user?.id, {
        full_name: editName,
        phone: editPhone,
      });
      await refreshProfile();
      addToast("Profile details updated successfully! 🐾", "success");
    } catch {
      addToast("Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await profileService.addAddress(user?.id, {
        full_name: newAddr.fullName,
        phone: newAddr.phone,
        address_line_1: newAddr.addressLine1,
        area: newAddr.area,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        is_default: addresses.length === 0,
      });
      setIsAddingAddress(false);
      setNewAddr({
        fullName: "",
        phone: "",
        addressLine1: "",
        area: "",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "",
      });
      await loadAddresses();
      addToast("New Bengaluru address saved!", "success");
    } catch {
      addToast("Failed to save address", "error");
    }
  };

  const getOrderStatusPillClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "order-status-pill--delivered";
      case "shipped":
      case "out_for_delivery":
        return "order-status-pill--shipped";
      case "confirmed":
      case "processing":
      case "packed":
        return "order-status-pill--confirmed";
      default:
        return "order-status-pill--pending";
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="jivvi-account-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Account Header */}
        <div className="account-modal-header">
          <div className="account-avatar-wrap">
            <span className="account-avatar-emoji">🐾</span>
            <div>
              <div className="account-name-badge">
                <h3 className="account-user-name">{profile?.full_name || user?.email?.split("@")[0] || "Valued Customer"}</h3>
                {isAdmin && <span className="account-admin-tag">⚡ Administrator</span>}
              </div>
              <p className="account-user-email">{user?.email || "customer@jivvi.in"}</p>
            </div>
          </div>

          <button className="auth-close-btn" onClick={onClose} aria-label="Close account modal">
            ✕
          </button>
        </div>

        {/* Modal Navigation Bar */}
        <div className="account-modal-nav">
          <div className="account-tabs-list" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "orders"}
              className={`account-nav-tab ${activeTab === "orders" ? "account-nav-tab--active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              📦 My Orders ({orders.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "addresses"}
              className={`account-nav-tab ${activeTab === "addresses" ? "account-nav-tab--active" : ""}`}
              onClick={() => setActiveTab("addresses")}
            >
              📍 Addresses ({addresses.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "profile"}
              className={`account-nav-tab ${activeTab === "profile" ? "account-nav-tab--active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              👤 Profile
            </button>
          </div>

          <div className="account-nav-actions">
            {isAdmin && onOpenAdmin && (
              <button
                type="button"
                className="admin-launch-btn"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
              >
                ⚡ Open Admin Dashboard
              </button>
            )}

            <button
              type="button"
              className="account-signout-btn"
              onClick={() => {
                signOut();
                onClose();
                addToast("Signed out successfully.", "info");
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && (
          <div className="account-tab-content">
            {loadingOrders ? (
              <div className="account-loading-box">Loading your order history...</div>
            ) : orders.length === 0 ? (
              <div className="account-empty-state">
                <span className="empty-emoji">📦</span>
                <h4>No orders found</h4>
                <p>You haven't placed any orders yet. Discover our curated dog & cat nutrition favorites!</p>
                <button type="button" className="primary-button" onClick={onClose}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="account-orders-list">
                {orders.map((order) => (
                  <div key={order.id || order.order_number} className="account-order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-card-number">{order.order_number}</span>
                        <span className="order-card-date">
                          Placed on {new Date(order.created_at || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="order-card-status-cluster">
                        <span className={`order-status-pill ${getOrderStatusPillClass(order.order_status)}`}>
                          ● {order.order_status?.toUpperCase() || "CONFIRMED"}
                        </span>
                        <span className="order-payment-pill">
                          {order.payment_status === "paid" ? "PAID" : order.payment_status?.toUpperCase() || "PAID"}
                        </span>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div className="order-card-items">
                      {(order.order_items || []).map((item, idx) => (
                        <div key={item.id || idx} className="order-line-item">
                          <span className="order-item-bullet">🐾</span>
                          <span className="order-item-name">{item.product_name}</span>
                          <span className="order-item-qty">x{item.quantity}</span>
                          <span className="order-item-price">₹{Number(item.total_price || item.unit_price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="order-card-footer">
                      <div className="order-shipping-dest">
                        📍 <strong>Delivering to:</strong> {order.shipping_address || order.shipping_name}, {order.shipping_city || "Bengaluru"}
                      </div>
                      <div className="order-total-sum">
                        Total: <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === "addresses" && (
          <div className="account-tab-content">
            <div className="addresses-head-row">
              <h4>Saved Bengaluru Delivery Addresses</h4>
              {!isAddingAddress && (
                <button
                  type="button"
                  className="add-address-trigger-btn"
                  onClick={() => setIsAddingAddress(true)}
                >
                  + Add New Address
                </button>
              )}
            </div>

            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="add-address-form-box">
                <h5>Add Bengaluru Shipping Address</h5>
                <div className="form-row-2">
                  <div className="auth-input-group">
                    <label>Contact Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh N."
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98860 12345"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>House / Flat / Street Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. #42, 4th Cross, Koramangala"
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="auth-input-group">
                    <label>Area / Landmark</label>
                    <input
                      type="text"
                      placeholder="Near Wipro Park"
                      value={newAddr.area}
                      onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560034"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="add-address-form-actions">
                  <button type="submit" className="primary-button">
                    Save Address 🐾
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setIsAddingAddress(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="addresses-grid">
              {addresses.map((addr) => (
                <div key={addr.id} className="address-display-card">
                  <div className="address-display-head">
                    <strong>{addr.full_name}</strong>
                    {addr.is_default && <span className="default-address-pill">Default</span>}
                  </div>
                  <p className="address-display-phone">📞 {addr.phone}</p>
                  <p className="address-display-text">
                    {addr.address_line_1}, {addr.area}, {addr.city} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === "profile" && (
          <div className="account-tab-content">
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <div className="auth-input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98860 12345"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "customer@jivvi.in"}
                />
                <span className="input-helper-text">Managed via Supabase Auth</span>
              </div>

              <button
                type="submit"
                className="primary-button profile-save-btn"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Saving..." : "Save Profile Details 🐾"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
