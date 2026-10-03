# JIVVI — Project Memory & Architectural Decisions Log

## 1. Project Technology Baseline

* **Backend Platform:** Supabase (Cloud / Managed)
* **Core Database:** PostgreSQL 15+
* **Authentication:** Supabase Auth (GoTrue, JWT, secure sessions)
* **Asset Storage:** Supabase Storage (S3-compatible, CDN-backed)
* **Serverless Functions:** Supabase Edge Functions (Deno / TypeScript runtime)
* **Payment Processing:** Razorpay (Standard Checkout, Webhooks, HMAC-SHA256 verification)
* **Frontend Application:** React 19 + Vite 8 Single-Page Application (SPA)

---

## 2. Core Architectural & Security Decisions

### Decision 01 — Zero-Trust Client Pricing & Payments
* **Rationale:** Client-side requests can be intercepted or manipulated by malicious actors.
* **Implementation:** The client never specifies the price, coupon discount, delivery fee, or total order amount. The serverless Edge Function fetches active catalog prices and recalculates the final amount in paise before generating the Razorpay Order.
* **Payment State:** An order is never marked as `paid` or `confirmed` from a frontend flag. Razorpay's HMAC-SHA256 signature is verified in `verify-razorpay-payment` using constant-time comparison with `RAZORPAY_KEY_SECRET`.

### Decision 02 — Data Privacy & Cost Price Isolation
* **Rationale:** Wholesale cost prices (`cost_price`) and supplier contracts are strictly confidential trade secrets.
* **Implementation:** `cost_price` in the `products` table is protected by PostgreSQL Row Level Security. Normal customer sessions query `public_products` (a view omitting `cost_price`) or queries selecting specific public columns. Only authenticated administrators with `role = 'admin'` can access `cost_price` and supplier tables.

### Decision 03 — Atomic Inventory Operations & Concurrency Safety
* **Rationale:** Preventing overselling when concurrent customers attempt to purchase limited inventory items.
* **Implementation:** Database transactions and triggers ensure that `available_quantity` is decremented atomically inside the PostgreSQL database via RPC function `complete_order_payment(...)`. A database constraint `CHECK (stock_quantity >= 0)` guarantees that inventory can never become negative.

### Decision 04 — Historical Order Integrity (Price & Name Snapshots)
* **Rationale:** Product prices and descriptions fluctuate over time, but historical invoices and tax records must remain immutable.
* **Implementation:** `order_items` stores frozen snapshots of `product_name`, `sku`, `unit_price`, and `total_price` at the moment of order placement, rather than referencing live product records.

### Decision 05 — Order Number Sequence
* **Rationale:** Customer-facing order IDs must be human-readable, sequential, and professional.
* **Implementation:** Managed by PostgreSQL sequence generating formatted identifiers: `JIVVI-2026-000001`, `JIVVI-2026-000002`, etc.

### Decision 06 — Supplier & Procurement Model
* **Rationale:** JIVVI sources products from wholesalers before selling them on the storefront.
* **Implementation:** Dedicated tables `suppliers`, `supplier_products`, `purchase_orders`, and `purchase_order_items`. When an admin marks a Purchase Order status as `received`, a database trigger automatically increments product inventory.

### Decision 07 — Verified Reviews Architecture
* **Rationale:** Authenticity is paramount in pet wellness; fake or competitor reviews damage trust.
* **Implementation:** Reviews require a valid `order_id` where `user_id = auth.uid()` and the order contains the target `product_id`. Reviews default to `is_approved = true` for verified purchasers or can be moderated by admins.

### Decision 08 — Client Resilience & Fallback Support
* **Rationale:** The application must remain browsable and presentable even when environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are being initialized or when testing in offline sandbox environments.
* **Implementation:** The service layer in `src/services/` gracefully queries Supabase when configured, and falls back to curated in-memory datasets (`src/data/products.js`, `categories.js`) if connection is unavailable.

---

## 3. Development Milestones Log

* **2026-09-30:** Initial frontend inspection. Confirmed React 19 + Vite 8.
* **2026-09-30:** Brand assets verified and placed in `public/images/`.
* **2026-10-01:** Frontend components, CartDrawer, WishlistDrawer, and search implemented.
* **2026-10-02:** Backend architecture designed: Supabase + PostgreSQL + Edge Functions + Razorpay.
* **2026-10-02:** Database schema defined with 21 normalized tables, RLS policies, atomic inventory triggers, and seed catalog.
* **2026-10-02:** Edge Functions authored for order creation, signature verification, webhook processing, and coupon evaluation.
* **2026-10-02:** Client services created (`src/services/`): products, categories, cart, wishlist, orders, payments, coupons, profile, admin, reviews.
* **2026-10-02:** Auth modal, Customer Account modal, Checkout flow, and Admin Dashboard implemented following JIVVI brand design tokens.
