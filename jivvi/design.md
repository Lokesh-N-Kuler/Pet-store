# JIVVI — Design System & UI Specifications

## 1. Brand Color Palette & Semantics

The JIVVI visual identity embodies warmth, natural pet wellness, transparency, and dependable care. All new customer-facing and administrative interfaces strictly adhere to this palette.

| Color Name | Hex Code | Semantic Role & Application |
| :--- | :--- | :--- |
| **Soft Cream** | `#FFF7EC` | Global page canvas, card backgrounds, modal backdrops |
| **Warm Sand** | `#F3E2C8` | Secondary cards, subtle section separation, banner backgrounds, table headers |
| **Charcoal** | `#333333` | Primary body text, secondary captions, metadata, form labels |
| **Soft Dark** | `#111111` | Primary titles, hero headlines, structural footer, admin navigation bar |
| **Fresh Green** | `#4CAF50` | Primary action CTAs, "Add to Cart", "Pay with Razorpay", in-stock badges |
| **Soft Sage** | `#A7D7A2` | Secondary badges, pet species tags, pill accents, borders |
| **Warm Orange** | `#FF9800` | Discount tags, low-stock warnings, pending status pills, rating stars |

### Additional UI Neutrals & States
* **Card Surface:** `#FFFFFF`
* **Subtle Border Tint:** `rgba(51, 51, 51, 0.08)`
* **Overlay Backdrop Scrim:** `rgba(17, 17, 17, 0.60)` with subtle backdrop blur
* **Error / Alert Red:** `#E53935` (Validation errors, payment failure messages)
* **Info / Blue Accent:** `#2196F3` (Delivery tracking stage)

---

## 2. Typography Hierarchy

* Primary Body & Controls: `"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
* Display Headings: `"Playfair Display", Georgia, serif`

---

## 3. UI Component Specifications for Backend Flows

### 3.1 Customer Authentication Modal (`AuthModal`)
* **Layout:** Centered modal card with clean tabs (`Sign In`, `Create Account`, `Reset Password`).
* **Visual Polish:** Header features the authentic JIVVI heart-paw logo icon with warm subtitle ("Welcome back to JIVVI").
* **Inputs:** Rounded inputs (`border-radius: 12px; border: 1.5px solid rgba(51, 51, 51, 0.15)`) with active focus ring in `#4CAF50`.
* **Primary Action:** Solid Fresh Green button (`#4CAF50`) with loading spinner state ("Signing in...").
* **Feedback:** Inline error alert banner with `#FFEBEE` background and `#C62828` text.

### 3.2 Customer Checkout Modal (`CheckoutModal`)
* **Layout:** Two-column split layout on desktop (Left: Customer Details & Bengaluru Shipping Address; Right: Order Summary & Coupon).
* **Delivery Address Selection:**
  * Displays saved addresses with radio selection cards.
  * "+ Add New Bengaluru Address" inline expandable form (Full Name, Phone, Address Line 1, Area/Landmark, City: Bengaluru, Pincode).
* **Coupon Section:**
  * Sleek coupon code input with "Apply" button.
  * Verified coupon feedback tag (e.g. `WELCOME10 (-₹150.00)` in `#4CAF50`).
* **Price Breakdown:**
  * Subtotal: ₹X,XXX
  * Coupon Discount: -₹XXX (in `#4CAF50`)
  * Delivery (Bengaluru Express): FREE or ₹79
  * Final Total: ₹X,XXX (Large bold in `#111111`)
* **Payment CTA:**
  * Prominent button: "Pay ₹X,XXX with Razorpay 🔒" with lock badge and accepted payment badges (UPI, GPay, PhonePe, Cards, NetBanking).
  * Disabled state while order creation or signature verification is in progress ("Opening Razorpay...", "Verifying Payment...").

### 3.3 Order Confirmation Modal (`OrderConfirmationModal`)
* **Header:** Celebration animation with green checkmark badge: "Order Confirmed! 🐾".
* **Order Details Card:**
  * Unique Order ID badge (e.g. `JIVVI-2026-000001`) with copy-to-clipboard button.
  * Payment Status: `Paid via Razorpay` (Green pill badge).
  * Total Paid: `₹X,XXX`.
  * Delivery Address summary card with expected Bengaluru delivery date.
* **CTAs:**
  * "Track My Order" (opens Customer Account Orders view).
  * "Continue Shopping" (closes modal and returns to storefront).

### 3.4 Customer Account & Order History Modal (`AccountModal`)
* **Sidebar Navigation:**
  * My Profile
  * My Orders & Tracking
  * Saved Addresses
  * Wishlist
  * [If Admin] ⚡ Admin Dashboard
  * Sign Out
* **Order History Cards:**
  * Each order displays: Order Number, Date, Total Amount, Item Thumbnails, and Status Pill (`Confirmed`, `Processing`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`).
  * Interactive progress tracker showing the step-by-step fulfillment journey.

### 3.5 Admin Dashboard Modal (`AdminDashboardModal`)
* **Aesthetic Alignment:** Matches JIVVI's warm, professional design language rather than generic grey tables.
* **Top Metric Bar (KPI Cards):**
  1. Total Orders
  2. Today's Orders
  3. Total Revenue (Realized from paid orders)
  4. Pending Fulfillment
  5. Active Products
  6. Low Stock Alerts
* **Admin Navigation Tabs:**
  * 📊 Overview
  * 📦 Products (Add, edit, set cost/sale price, activate/deactivate)
  * 📋 Inventory (Live stock, low-stock threshold alert, manual adjustments)
  * 🚚 Orders (Filter by status, view line items, update fulfillment status)
  * 👥 Customers (Directory & order counts)
  * 🏭 Suppliers & Purchase Orders (Procurement directory, PO receiving)
  * 🎟️ Coupons (Create and manage discount codes)
  * ⭐ Reviews (Review moderation)
* **Status Badges:**
  * `pending`: Warm Sand (`#F3E2C8`)
  * `confirmed`: Soft Sage (`#A7D7A2`)
  * `shipped` / `out_for_delivery`: Info Blue
  * `delivered`: Fresh Green (`#4CAF50`)
  * `cancelled`: Soft Red
