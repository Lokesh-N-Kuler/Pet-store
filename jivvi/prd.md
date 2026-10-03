# JIVVI — Product Requirements Document (PRD)

## 1. Product Overview
* **Product Name:** JIVVI — Modern Pet Care & Pet Products E-Commerce Platform
* **Tagline:** For Every Little Life. Happy Pets. Happier Pet Parents.
* **Domain:** Curated Pet Wellness, Nutrition, Accessories & Lifestyle Essentials
* **Initial Geography:** Launching in Bengaluru with express local delivery; scaling across India
* **Business Model:** Direct-to-Consumer (D2C) sourcing curated pet supplies from authorized pet-product wholesalers/distributors and selling directly via the JIVVI storefront.

---

## 2. Product Vision & Architecture Goal
Pet parents demand uncompromising quality and safety for their dogs and cats. JIVVI provides a welcoming, transparent, and curated e-commerce experience. The frontend Single-Page Application (React 19 + Vite 8) connects to a production-ready **Supabase** backend (PostgreSQL database, Supabase Auth, Row Level Security, Supabase Storage, and Supabase Edge Functions) with a secure server-side **Razorpay** payment gateway integration.

---

## 3. Core Business Workflow
```text
Supplier / Wholesaler
        ↓
Purchase Order & JIVVI Inventory
        ↓
JIVVI Storefront Catalog (Active Products)
        ↓
Customer Browses, Searches, Selects
        ↓
Persistent Cart & Server-Side Stock Validation
        ↓
Secure Checkout (Bengaluru Address & Coupon Verification)
        ↓
Server-Side Final Calculation (Subtotal, Discount, Delivery Fee)
        ↓
Razorpay Order Creation (Edge Function)
        ↓
Customer Pays via Razorpay Modal (UPI, Cards, NetBanking)
        ↓
Server-Side Signature Verification & Idempotent Capture
        ↓
Payment Marked 'PAID' & Order Marked 'CONFIRMED'
        ↓
Atomic Inventory Deduction & Cart Cleared
        ↓
Customer Receives Confirmation & Tracks Order
        ↓
JIVVI Admin: Fulfillment (Processing → Packed → Shipped → Delivered)
```

---

## 4. Feature Requirements

### 4.1 Customer Features
* **Browse Products:** High-performance catalog browsing filtered by species (Dogs, Cats, Both) and categories.
* **Search Products:** Fast indexed full-text search across product name, description, brand, category, and SKU.
* **Filter & Sort:** Filter by category, species, in-stock status, and price range.
* **Product Categories:** Visual hubs for Dogs, Cats, Food & Treats, Toys, Grooming, Beds & Comfort, Health & Wellness, Accessories.
* **Product Details:** High-resolution product images, brand details, verified reviews & ratings, nutritional information, sizes, and real-time stock availability. (Private fields such as `cost_price` and supplier details are strictly hidden).
* **Add to Cart & Cart Management:** Add items, update quantities with server stock validation, remove items, clear cart, and view free Bengaluru express shipping progress meter (threshold ₹999).
* **Wishlist:** Save favorite items to wishlist with quick one-click move to cart.
* **Customer Authentication:** Supabase Auth for email/password registration, login, logout, password recovery, and persistent sessions.
* **Customer Profile:** View and update personal profile details (full name, phone, email, avatar).
* **Saved Addresses:** Add, edit, remove, and select default delivery addresses (focusing initially on Bengaluru pincodes).
* **Checkout Flow:** Transparent multi-step checkout validating cart items, server-side prices, stock, delivery address, and coupon codes.
* **Razorpay Payment Integration:** Seamless integration opening Razorpay standard checkout, handling UPI, cards, and net banking without exposing secret keys to the browser.
* **Order Confirmation:** Immediate clear confirmation with unique order number (e.g. `JIVVI-2026-000001`), payment reference, delivery address, and estimated timeline.
* **Order History & Details:** Comprehensive customer view of historical orders, items purchased, prices at purchase time, payment status, and order fulfillment status.
* **Order Status Tracking:** Visual stage tracking: `confirmed` → `processing` → `packed` → `shipped` → `out_for_delivery` → `delivered`.
* **Product Reviews:** Verified purchase reviews (customers can only review products they have actually purchased in completed orders).
* **Responsive Mobile Experience:** Fluid, thumb-friendly navigation with touch-optimized off-canvas drawers for Cart, Wishlist, Account, and Search.

### 4.2 Admin Features
* **Admin Authentication & RBAC:** Secure role-based access control (`role = 'admin'`). Customers cannot assign themselves the admin role.
* **Executive Dashboard:** Real-time KPI metrics:
  * Total Orders & Today's Orders
  * Total Revenue (calculated exclusively from confirmed, paid orders)
  * Pending Orders needing fulfillment
  * Total Active Products
  * Low Stock Alerts (products at or below `low_stock_threshold`)
  * Total Registered Customers
* **Product Management:**
  * Create, edit, deactivate/activate products
  * Set public prices and `sale_price`
  * Set private `cost_price` (admin only)
  * Assign category and brand
  * Mark products as featured
  * Upload and organize multiple product images in Supabase Storage
  * Safe archiving (`is_active = false`) rather than hard deletion to preserve historical order integrity
* **Category & Brand Management:** Create and edit product categories and brand partners with image banners.
* **Inventory Management:**
  * Real-time stock counts (`quantity`, `reserved_quantity`, `available_quantity`)
  * Low-stock thresholds and alert indicators
  * Stock adjustment with audit notes
  * Atomic synchronization preventing negative stock
* **Order Management & Fulfillment:**
  * View all customer orders with customer details and line items
  * Filter orders by status (`pending`, `confirmed`, `processing`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`)
  * Update order status with transition validation
  * View payment details and Razorpay transaction IDs
* **Customer Management:** View registered customer directory, order counts, and registration dates.
* **Supplier & Procurement Management:**
  * Maintain wholesaler/supplier directory (contact details, GST numbers, notes)
  * Map supplier products with supplier SKU, cost price, and lead time
  * Create and track Purchase Orders (Draft, Ordered, Partially Received, Received, Cancelled)
  * Automatically update inventory when purchase order stock is received
* **Coupon & Promotions Management:**
  * Create discount coupons (`percentage` or `fixed` discount)
  * Set minimum order amounts, maximum discount caps, usage limits, and validity dates
  * Track coupon redemptions and prevent abuse
* **Review Moderation:** Approve or hide customer reviews before they appear publicly.
* **Payment & Refund Administration:** Track payment transactions, failures, and initiate server-side refunds.

### 4.3 Future Features (Post-Launch Roadmap)
* **Pet Profiles:** Save pet name, breed, age, weight, allergies, and vaccination schedules.
* **AI Pet Care Assistant:** Multimodal veterinary triage & dietary assistant powered by Gemini.
* **Personalized Recommendations:** Species-specific nutrition and accessory bundles based on pet profile.
* **Subscription & Auto-Replenishment:** Recurring scheduled deliveries for kibble, wet food, and cat litter ("Subscribe & Save 10%").
* **Loyalty & Rewards Program ("PawPoints"):** Earn points on purchases, redeemable for discounts.
* **Multi-Vendor Marketplace:** Platform expansion for certified pet bakeries and local artisans.
* **Nationwide Logistics Integration:** Automated API webhooks with Delhivery, Shadowfax, and Shiprocket.
* **Private-Label JIVVI Products:** Launch of proprietary organic treats and orthopedic bedding.

---

## 5. Non-Functional Requirements
1. **Security:** Zero client exposure of `RAZORPAY_KEY_SECRET` or Supabase `service_role` key. All payment signatures and stock changes verified server-side.
2. **Data Integrity:** Strict foreign key constraints, Row Level Security (RLS) on all tables, and atomic database functions to eliminate overselling race conditions.
3. **Performance:** Database indexes on frequently filtered columns (`category_id`, `pet_type`, `is_active`, `slug`, `order_number`). Fast paginated responses.
4. **Reliability:** Idempotent payment webhook processing to handle duplicate Razorpay callbacks safely.
5. **Design Consistency:** All new customer and admin modal interfaces strictly adhere to the warm, trusted JIVVI design palette (`#FFF7EC`, `#F3E2C8`, `#4CAF50`, `#FF9800`, `#111111`).
