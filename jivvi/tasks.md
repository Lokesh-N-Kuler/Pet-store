# JIVVI Backend & E-Commerce Implementation Checklist

Legend:
- `[ ]` Not started / In progress
- `[x]` Completed and verified

---

## 1. Project Setup
- [x] Inspect existing React 19 frontend codebase in `d:\Jivvi\jivvi`
- [x] Verify layout preservation rules and authentic brand images
- [x] Initialize documentation suite (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `tasks.md`, `memory.md`, `supabase.md`, `deployment.md`)
- [x] Install `@supabase/supabase-js` library
- [x] Create `.env.example` with client and Edge Function variables

## 2. Supabase Setup
- [x] Initialize Supabase configuration directory (`supabase/`)
- [x] Configure client connection layer in `src/lib/supabase.js` with fallback mode
- [x] Define Edge Function directory structure

## 3. Database
- [x] Migration `001_initial_schema.sql` creating 21 normalized tables
- [x] Primary keys (UUID), foreign keys, and indexes on lookup columns
- [x] Create safe public product view masking confidential `cost_price`
- [x] Delivery configuration table for Bengaluru pincodes & fee rules
- [x] Create comprehensive seed script `supabase/seed.sql` with rich catalog data

## 4. Row Level Security (RLS)
- [x] Migration `002_rls_policies.sql` enabling RLS on all customer-facing tables
- [x] Security helper function `is_admin()` checking `profiles.role = 'admin'`
- [x] Customer self-isolation policies on `profiles`, `addresses`, `carts`, `wishlists`, `orders`, `payments`
- [x] Public read policies for active `categories`, `brands`, `products` (excluding cost price)
- [x] Admin-only policies for `suppliers`, `supplier_products`, `purchase_orders`, `coupons`

## 5. Authentication
- [x] Supabase Auth integration for email/password registration, login, logout, password recovery
- [x] PostgreSQL trigger `on_auth_user_created` to automatically create a customer profile
- [x] Implement `AuthContext.jsx` with real session persistence and profile loading
- [x] Build `AuthModal.jsx` matching JIVVI warm design system
- [x] Connect Navbar user icon to open AuthModal or Customer Account

## 6. Products
- [x] Product service layer (`src/services/products.js`) with DB queries and fallback
- [x] Live search across product name, description, SKU, brand, and category
- [x] Category and pet species filtering query integration
- [x] Stock availability checking

## 7. Categories
- [x] Category service layer (`src/services/categories.js`)
- [x] Connect `PetCategories` (Dogs / Cats) and `CategoryGrid` to real data

## 8. Brands
- [x] Brand service layer (`src/services/brands.js`)
- [x] Support brand metadata, logos, and filtering

## 9. Storage
- [x] Define Supabase Storage buckets: `product-images`, `category-images`, `brand-images`, `avatars`
- [x] Define storage RLS policies: public read, authenticated user avatar upload, admin-only catalog upload

## 10. Inventory
- [x] Migration `003_inventory_and_functions.sql`
- [x] Triggers synchronizing `products.stock_quantity` with `inventory.quantity`
- [x] Atomic inventory deduction and reservation functions preventing overselling
- [x] Negative inventory constraints and low-stock threshold triggers

## 11. Cart
- [x] Cart service layer (`src/services/cart.js`)
- [x] Connect `CartContext.jsx` to synchronize items with Supabase for logged-in users
- [x] Seamless fallback to localStorage for guest shoppers
- [x] Server-side stock validation before cart modifications

## 12. Wishlist
- [x] Wishlist service layer (`src/services/wishlist.js`)
- [x] Synchronize saved favorites with Supabase for authenticated users
- [x] Guest fallback to localStorage with one-click move to cart

## 13. Checkout
- [x] Build `CheckoutModal.jsx` with multi-step Bengaluru shipping address form
- [x] Server-side calculation of subtotals, delivery fees, and discounts
- [x] Loading states, validation guards, and error banners

## 14. Coupons
- [x] Migration `004_orders_and_checkout.sql` with coupon tables and RPC validation
- [x] Edge Function `supabase/functions/apply-coupon/index.ts`
- [x] Validate minimum order amount, maximum discount, expiry, and single-use limits

## 15. Orders
- [x] Unique order number generation (`JIVVI-2026-XXXXXX`) via PostgreSQL sequence
- [x] Atomic pending order creation function
- [x] Store historical snapshot of product name, SKU, and unit price in `order_items`
- [x] Build `OrderConfirmationModal.jsx` with copyable order number and tracking links

## 16. Payments
- [x] Migration `005_payments_and_razorpay.sql`
- [x] Payment service layer (`src/services/payments.js`)
- [x] Atomic RPC `complete_order_payment(...)` linking order, payment, inventory, and coupon usage

## 17. Razorpay
- [x] Edge Function `supabase/functions/create-razorpay-order/index.ts`
- [x] Edge Function `supabase/functions/verify-razorpay-payment/index.ts` with constant-time HMAC-SHA256 signature verification
- [x] Load Razorpay Checkout SDK dynamically in frontend
- [x] Handle checkout completion, payment cancellation, and payment failure states gracefully

## 18. Webhooks
- [x] Edge Function `supabase/functions/razorpay-webhook/index.ts`
- [x] Verify webhook signature (`X-Razorpay-Signature`) using `RAZORPAY_WEBHOOK_SECRET`
- [x] Idempotent processing of `payment.captured`, `payment.failed`, `refund.created`, `refund.processed`

## 19. Admin
- [x] Admin service layer (`src/services/admin.js`)
- [x] Build `AdminDashboardModal.jsx` with KPI cards (Orders, Revenue, Products, Low Stock)
- [x] Product management tab: create, edit, deactivate, set prices (including cost price)
- [x] Inventory management tab: view stock, low-stock alerts, adjust quantities
- [x] Order management tab: view line items, update fulfillment statuses with state transition rules

## 20. Suppliers
- [x] Migration `006_suppliers_and_procurement.sql`
- [x] Suppliers table with business name, contact info, GST, notes
- [x] Supplier products mapping table with supplier SKU and cost price

## 21. Purchase Orders
- [x] Purchase order and line items tables with status flow (Draft → Ordered → Received)
- [x] Automatic inventory replenishment trigger when PO status is updated to `received`

## 22. Reviews
- [x] Reviews service layer (`src/services/reviews.js`)
- [x] Verified purchaser validation (user must have a confirmed order containing the product)
- [x] Admin review moderation support

## 23. Customer Account
- [x] Build `AccountModal.jsx`
- [x] Customer Profile management (update name, phone)
- [x] Address book management (add, edit, delete, set default)
- [x] Order history with status progress tracker

## 24. Deployment
- [x] Author comprehensive `deployment.md` covering Supabase project, Edge Functions, secrets, and Vercel/Netlify frontend hosting
- [x] Author technical reference `supabase.md`

## 25. Security Testing
- [x] Verify that customers cannot query `cost_price` or supplier tables
- [x] Verify that customer A cannot read customer B's addresses, cart, or orders
- [x] Verify that signature verification rejects tampered payment payloads
- [x] Verify that customers cannot assign themselves the `admin` role

## 26. Performance Testing
- [x] Verify database query indexing on `slug`, `sku`, `category_id`, `pet_type`, `user_id`
- [x] Ensure fast client bundle build with zero bloat

## 27. Final Production Testing
- [x] Complete end-to-end simulation: Browse → Cart → Login → Address → Coupon → Server-Calculated Checkout → Razorpay Payment → Server Verification → Order Confirmed → Inventory Deducted → Admin Order Status Update
- [x] Verify clean frontend production build (`npm run build`)
