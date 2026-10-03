// ==============================================================================
// ADMIN DASHBOARD MODAL COMPONENT
// File: src/components/Admin/AdminDashboardModal.jsx
// ==============================================================================

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/admin";
import { ordersService } from "../../services/orders";

export default function AdminDashboardModal({ isOpen, onClose }) {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'products' | 'inventory' | 'orders' | 'suppliers'
  const [metrics, setMetrics] = useState({
    total_orders: 0,
    today_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    total_products: 0,
    low_stock_products: 0,
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit stock state
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState("");

  // Product edit modal state
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null,
    name: "",
    sku: "",
    price: "",
    sale_price: "",
    cost_price: "",
    stock_quantity: "",
    low_stock_threshold: 5,
  });

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, p, o, s] = await Promise.all([
        adminService.getMetrics(),
        adminService.getProducts(),
        ordersService.getAdminOrders("all"),
        adminService.getSuppliers(),
      ]);
      setMetrics(m);
      setProducts(p);
      setOrders(o);
      setSuppliers(s);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      addToast(`Order updated to "${newStatus}"!`, "success");
      const updatedOrders = await ordersService.getAdminOrders("all");
      setOrders(updatedOrders);
    } catch {
      addToast("Failed to update order status", "error");
    }
  };

  const handleSaveStock = async (productId) => {
    try {
      await adminService.updateStock(productId, Number(stockInput));
      addToast("Inventory stock updated!", "success");
      setEditingStockId(null);
      loadDashboardData();
    } catch {
      addToast("Failed to adjust inventory", "error");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      await adminService.saveProduct(productForm);
      setIsEditingProduct(false);
      addToast("Product details saved successfully!", "success");
      loadDashboardData();
    } catch {
      addToast("Failed to save product", "error");
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="jivvi-admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Admin Header */}
        <div className="admin-modal-header">
          <div className="admin-title-cluster">
            <span className="admin-badge-icon">⚡</span>
            <div>
              <h3 className="admin-main-title">JIVVI Admin Executive Suite</h3>
              <p className="admin-subtitle">Live Operations, Inventory Management & Bengaluru Fulfillment</p>
            </div>
          </div>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close admin dashboard">
            ✕
          </button>
        </div>

        {/* Admin Tab Navigation */}
        <div className="admin-nav-bar">
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === "overview" ? "admin-nav-btn--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Executive Overview
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === "orders" ? "admin-nav-btn--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            🚚 Orders ({orders.length})
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === "products" ? "admin-nav-btn--active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products ({products.length})
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === "inventory" ? "admin-nav-btn--active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            📋 Inventory & Stock
          </button>
          <button
            type="button"
            className={`admin-nav-btn ${activeTab === "suppliers" ? "admin-nav-btn--active" : ""}`}
            onClick={() => setActiveTab("suppliers")}
          >
            🏭 Suppliers ({suppliers.length})
          </button>
        </div>

        {/* Tab 1: Overview & KPI Metric Cards */}
        {activeTab === "overview" && (
          <div className="admin-content-section">
            <div className="admin-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">TOTAL ORDERS</span>
                <span className="kpi-value">{metrics.total_orders}</span>
                <span className="kpi-subtext">All time orders</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">TODAY'S ORDERS</span>
                <span className="kpi-value kpi-value--highlight">{metrics.today_orders}</span>
                <span className="kpi-subtext">Received today</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">REALIZED REVENUE</span>
                <span className="kpi-value kpi-value--green">₹{Number(metrics.total_revenue).toLocaleString("en-IN")}</span>
                <span className="kpi-subtext">From confirmed paid orders</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">PENDING FULFILLMENT</span>
                <span className="kpi-value kpi-value--orange">{metrics.pending_orders}</span>
                <span className="kpi-subtext">Needs pack & dispatch</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">ACTIVE PRODUCTS</span>
                <span className="kpi-value">{metrics.total_products}</span>
                <span className="kpi-subtext">In public catalog</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">LOW STOCK ALERTS</span>
                <span className="kpi-value kpi-value--red">{metrics.low_stock_products}</span>
                <span className="kpi-subtext">At or below threshold</span>
              </div>
            </div>

            {/* Quick Recent Orders Preview */}
            <div className="admin-section-block">
              <div className="section-head-between">
                <h4>Recent Customer Orders</h4>
                <button type="button" className="text-link-btn" onClick={() => setActiveTab("orders")}>
                  View All Orders →
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id || ord.order_number}>
                        <td><strong>{ord.order_number}</strong></td>
                        <td>{ord.shipping_name || ord.user?.full_name || "Customer"}</td>
                        <td>₹{Number(ord.total_amount).toLocaleString("en-IN")}</td>
                        <td><span className="status-badge status-badge--paid">{ord.payment_status}</span></td>
                        <td><span className="status-badge status-badge--confirmed">{ord.order_status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => setActiveTab("orders")}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Fulfillment */}
        {activeTab === "orders" && (
          <div className="admin-content-section">
            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer & Phone</th>
                    <th>Bengaluru Address</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Fulfillment Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id || ord.order_number}>
                      <td>
                        <strong>{ord.order_number}</strong>
                        <div className="table-sub-date">
                          {new Date(ord.created_at || Date.now()).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td>
                        {ord.shipping_name}
                        <div className="table-sub-info">📞 {ord.shipping_phone}</div>
                      </td>
                      <td>
                        <div className="table-address-clip" title={ord.shipping_address}>
                          {ord.shipping_address}, {ord.shipping_pincode}
                        </div>
                      </td>
                      <td><strong>₹{Number(ord.total_amount).toLocaleString("en-IN")}</strong></td>
                      <td><span className="status-badge status-badge--paid">{ord.payment_status?.toUpperCase()}</span></td>
                      <td>
                        <span className={`status-badge status-badge--${ord.order_status}`}>
                          {ord.order_status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-status-select"
                          value={ord.order_status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {activeTab === "products" && (
          <div className="admin-content-section">
            <div className="section-head-between">
              <h4>Product Master Catalog</h4>
              <button
                type="button"
                className="primary-button admin-add-btn"
                onClick={() => {
                  setProductForm({
                    id: null,
                    name: "",
                    sku: "",
                    price: "",
                    sale_price: "",
                    cost_price: "",
                    stock_quantity: "",
                    low_stock_threshold: 5,
                  });
                  setIsEditingProduct(true);
                }}
              >
                + Add New Product
              </button>
            </div>

            {isEditingProduct && (
              <form onSubmit={handleSaveProduct} className="admin-form-drawer">
                <h5>{productForm.id ? "Edit Product" : "Create New Product"}</h5>
                <div className="form-row-2">
                  <div className="auth-input-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>SKU</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      placeholder="Auto-generated if blank"
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="auth-input-group">
                    <label>Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Sale Price (₹, optional)</label>
                    <input
                      type="number"
                      value={productForm.sale_price}
                      onChange={(e) => setProductForm({ ...productForm, sale_price: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Cost Price (₹, Admin Only)</label>
                    <input
                      type="number"
                      required
                      value={productForm.cost_price}
                      onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="auth-input-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      value={productForm.low_stock_threshold}
                      onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                    />
                  </div>
                </div>

                <div className="add-address-form-actions">
                  <button type="submit" className="primary-button">Save Product 🐾</button>
                  <button type="button" className="secondary-button" onClick={() => setIsEditingProduct(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Cost Price (Admin)</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><code>{p.sku}</code></td>
                      <td><span className="cost-price-badge">₹{p.cost_price}</span></td>
                      <td>₹{p.sale_price || p.price}</td>
                      <td>
                        <span className={`stock-number ${p.stock_quantity <= p.low_stock_threshold ? "stock-number--low" : ""}`}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td><span className="status-badge status-badge--active">{p.is_active ? "Active" : "Archived"}</span></td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => {
                            setProductForm({
                              id: p.id,
                              name: p.name,
                              sku: p.sku,
                              price: p.price,
                              sale_price: p.sale_price || "",
                              cost_price: p.cost_price || 0,
                              stock_quantity: p.stock_quantity,
                              low_stock_threshold: p.low_stock_threshold || 5,
                            });
                            setIsEditingProduct(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Inventory Management */}
        {activeTab === "inventory" && (
          <div className="admin-content-section">
            <h4>Live Inventory & Stock Synchronization</h4>
            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Quantity</th>
                    <th>Threshold</th>
                    <th>Alert Status</th>
                    <th>Adjust Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><strong>{p.stock_quantity} units</strong></td>
                      <td>{p.low_stock_threshold} units</td>
                      <td>
                        {p.stock_quantity <= p.low_stock_threshold ? (
                          <span className="status-badge status-badge--low-stock">⚠️ LOW STOCK</span>
                        ) : (
                          <span className="status-badge status-badge--ok">✓ Normal</span>
                        )}
                      </td>
                      <td>
                        {editingStockId === p.id ? (
                          <div className="stock-inline-edit">
                            <input
                              type="number"
                              className="stock-edit-input"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                            />
                            <button type="button" className="stock-save-btn" onClick={() => handleSaveStock(p.id)}>Save</button>
                            <button type="button" className="stock-cancel-btn" onClick={() => setEditingStockId(null)}>✕</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="admin-action-btn"
                            onClick={() => {
                              setEditingStockId(p.id);
                              setStockInput(String(p.stock_quantity));
                            }}
                          >
                            Adjust Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Suppliers */}
        {activeTab === "suppliers" && (
          <div className="admin-content-section">
            <h4>Authorized Wholesalers & Distributors</h4>
            <div className="admin-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>GST Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.business_name}</strong></td>
                      <td>{s.contact_name}</td>
                      <td>{s.phone}</td>
                      <td><code>{s.gst_number}</code></td>
                      <td><span className="status-badge status-badge--active">Active Wholesaler</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
