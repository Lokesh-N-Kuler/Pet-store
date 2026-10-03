# JIVVI — Complete Technical Architecture

## 1. System Architecture Overview

JIVVI is built with a decoupled modern architecture combining a high-performance **React 19** frontend and a managed, highly available **Supabase** backend backed by **PostgreSQL**, **Supabase Auth**, **Supabase Storage**, **Supabase Edge Functions**, and **Razorpay** for payment processing.

```text
                    ┌────────────────────────────┐
                    │       CUSTOMER CLIENT      │
                    │   React 19 + Vite 8 SPA    │
                    │  (Desktop, Tablet, Mobile) │
                    └─────────────┬──────────────┘
                                  │
                   HTTPS / WSS    │   Supabase JS SDK (Anon Key)
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                   SUPABASE PLATFORM                    │
      │                                                        │
      │  ┌──────────────────┐  ┌──────────────────┐  ┌───────┐ │
      │  │  Supabase Auth   │  │ Supabase Storage │  │  RLS  │ │
      │  │ (JWT, GoTrue API)│  │ (Images, Assets) │  │Engine │ │
      │  └─────────┬────────┘  └────────┬─────────┘  └───┬───┘ │
      │            │                    │                │     │
      │            ▼                    ▼                ▼     │
      │  ┌──────────────────────────────────────────────────┐  │
      │  │            PostgreSQL 15+ Core Database          │  │
      │  │  • Normalized Schema (21+ tables)                │  │
      │  │  • Triggers & RPC Functions (Atomic Inventory)   │  │
      │  │  • Row Level Security (RLS) & Column Security    │  │
      │  └──────────────────────────┬───────────────────────┘  │
      │                             │                          │
      │  ┌──────────────────────────▼───────────────────────┐  │
      │  │              Supabase Edge Functions             │  │
      │  │               (Deno Runtime / TS)                │  │
      │  │  • create-razorpay-order                         │  │
      │  │  • verify-razorpay-payment                       │  │
      │  │  • razorpay-webhook                              │  │
      │  │  • apply-coupon                                  │  │
      │  └──────────────────────────┬───────────────────────┘  │
      └─────────────────────────────┼──────────────────────────┘
                                    │
                                    │ Razorpay REST API (Key + Secret)
                                    ▼
                      ┌───────────────────────────┐
                      │     RAZORPAY GATEWAY      │
                      │  UPI, Cards, NetBanking,  │
                      │  Webhooks & Signatures    │
                      └───────────────────────────┘
```

---

## 2. Directory Structure

```text
d:/Jivvi/
├── architecture.md             # System architecture documentation
├── deployment.md               # End-to-end production deployment guide
├── design.md                   # Brand design tokens, UI specifications
├── memory.md                   # Architectural decisions log
├── prd.md                      # Product requirements document
├── rules.md                    # Operational, security & development rules
├── supabase.md                 # Supabase technical reference & cheat-sheet
├── tasks.md                    # Implementation task checklist
│
├── supabase/                   # Supabase infrastructure code
│   ├── migrations/
│   │   ├── 001_initial_schema.sql          # 21 normalized tables, constraints, indexes
│   │   ├── 002_rls_policies.sql            # Comprehensive Row Level Security policies
│   │   ├── 003_inventory_and_functions.sql # Inventory sync & atomic reservation triggers
│   │   ├── 004_orders_and_checkout.sql     # Order sequence, pricing, coupon validation
│   │   ├── 005_payments_and_razorpay.sql   # Payment tables, verification & capture RPC
│   │   └── 006_suppliers_and_procurement.sql # Procurement & PO receiving stock updates
│   ├── functions/
│   │   ├── create-razorpay-order/          # Server-side checkout & Razorpay order creation
│   │   │   └── index.ts
│   │   ├── verify-razorpay-payment/        # HMAC-SHA256 signature verification & order capture
│   │   │   └── index.ts
│   │   ├── razorpay-webhook/               # Idempotent async webhook event processing
│   │   │   └── index.ts
│   │   └── apply-coupon/                   # Server-side coupon eligibility evaluation
│   │       └── index.ts
│   └── seed.sql                            # Production-ready demo catalog, categories, inventory
│
└── jivvi/                      # React Frontend application
    ├── public/
    │   ├── images/                         # Authentic brand & companion images
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── Account/                    # Customer Account Modal (Profile, Orders, Addresses)
    │   │   ├── Admin/                      # Admin Dashboard Modal (Metrics, Products, Inventory, Orders)
    │   │   ├── Auth/                       # Supabase Auth Modal (Login, Signup, Reset)
    │   │   ├── Checkout/                   # Checkout Modal & Order Confirmation Modal
    │   │   ├── Navbar/                     # Sticky header with real Auth status, Cart & Wishlist counters
    │   │   ├── Cart/                       # CartDrawer with server sync & checkout trigger
    │   │   ├── Wishlist/                   # WishlistDrawer with server sync
    │   │   ├── FeaturedProducts/           # Filterable catalog connected to Supabase
    │   │   ├── ProductCard/                # Card with live ratings, price, and stock status
    │   │   ├── CategoryGrid/               # Dynamic category tiles
    │   │   └── common/                     # Badge, Button, Rating, Toast primitives
    │   ├── context/
    │   │   ├── AuthContext.jsx             # Supabase Auth session & profile state
    │   │   ├── CartContext.jsx             # Unified cart state (guest localStorage + Supabase sync)
    │   │   ├── WishlistContext.jsx         # Unified wishlist state
    │   │   └── ToastContext.jsx            # Instant feedback notifications
    │   ├── lib/
    │   │   └── supabase.js                 # Initialized Supabase client with safe fallback
    │   ├── services/
    │   │   ├── products.js                 # Product queries, search, reviews
    │   │   ├── categories.js               # Category list & filtering
    │   │   ├── brands.js                   # Brand queries
    │   │   ├── cart.js                     # Server-side cart operations
    │   │   ├── wishlist.js                 # Server-side wishlist operations
    │   │   ├── orders.js                   # Order history, order tracking, admin status
    │   │   ├── payments.js                 # Razorpay SDK initialization & verification calls
    │   │   ├── coupons.js                  # Coupon verification
    │   │   ├── profile.js                  # Customer profiles & addresses
    │   │   ├── admin.js                    # Admin dashboard KPI metrics & inventory updates
    │   │   └── reviews.js                  # Verified reviews submission & retrieval
    │   ├── styles/                         # CSS tokens, reset, utility, and component styles
    │   ├── App.jsx                         # Main composition root with all modals
    │   └── main.jsx                        # React entry point
    ├── package.json
    └── vite.config.js
```

---

## 3. Database Schema Architecture

The database is fully normalized in PostgreSQL with foreign keys, constraints, and timestamps.

```text
                         ┌──────────────┐
                         │  auth.users  │
                         └──────┬───────┘
                                │ 1:1
                                ▼
                         ┌──────────────┐
                         │   profiles   │◄──────────────┐
                         └──────┬───────┘               │
                                │ 1:N                   │ 1:N
             ┌──────────────────┼─────────────────┐     │
             │ 1:N              │ 1:N             │     │
             ▼                  ▼                 ▼     │
      ┌─────────────┐    ┌─────────────┐   ┌────────────┴┐
      │  addresses  │    │    carts    │   │   orders    │
      └─────────────┘    └──────┬──────┘   └──────┬──────┘
                                │ 1:N             │ 1:N
                                ▼                 ▼
                         ┌─────────────┐   ┌─────────────┐
                         │ cart_items  │   │ order_items │
                         └──────┬──────┘   └──────┬──────┘
                                │                 │
                                └────────┐ ┌──────┘
                                         ▼ ▼
                                  ┌──────────────┐
                                  │   products   │
                                  └──────┬───────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │ 1:1                   │ 1:N                   │ 1:N
                 ▼                       ▼                       ▼
          ┌─────────────┐         ┌──────────────┐        ┌─────────────┐
          │  inventory  │         │product_images│        │   reviews   │
          └─────────────┘         └──────────────┘        └─────────────┘
```

### Table Definitions:

1. **`profiles`**: Extends `auth.users`. Contains `id` (UUID PK), `full_name`, `email`, `phone`, `role` (`customer` | `admin`), `avatar_url`, `created_at`, `updated_at`.
2. **`addresses`**: Customer shipping addresses. `id`, `user_id` (FK `profiles`), `full_name`, `phone`, `address_line_1`, `address_line_2`, `area`, `city`, `state`, `pincode`, `landmark`, `is_default`, `created_at`, `updated_at`.
3. **`categories`**: Product taxonomy. `id`, `name`, `slug` (unique), `description`, `image_url`, `pet_type` (`dog` | `cat` | `both`), `is_active`, `created_at`, `updated_at`.
4. **`brands`**: Manufacturer / partner brands. `id`, `name`, `slug` (unique), `description`, `logo_url`, `is_active`, `created_at`, `updated_at`.
5. **`products`**: Master product catalog. `id`, `category_id`, `brand_id`, `name`, `slug` (unique), `description`, `sku` (unique), `cost_price` (**ADMIN ONLY**), `price`, `sale_price`, `stock_quantity`, `low_stock_threshold`, `weight`, `is_featured`, `is_active`, `created_at`, `updated_at`.
6. **`product_images`**: Multi-image gallery per product. `id`, `product_id`, `image_url`, `alt_text`, `display_order`, `created_at`.
7. **`inventory`**: Dedicated inventory tracking. `id`, `product_id` (unique), `quantity`, `reserved_quantity`, `available_quantity` (`quantity - reserved_quantity`), `updated_at`.
8. **`wishlist`**: Customer wishlist header. `id`, `user_id` (unique), `created_at`, `updated_at`.
9. **`wishlist_items`**: Wishlist line items. `id`, `wishlist_id`, `product_id`, `created_at`.
10. **`carts`**: Customer shopping basket. `id`, `user_id` (unique), `created_at`, `updated_at`.
11. **`cart_items`**: Cart items. `id`, `cart_id`, `product_id`, `quantity`, `created_at`, `updated_at`.
12. **`orders`**: Master purchase orders. `id`, `user_id`, `order_number` (unique, e.g. `JIVVI-2026-000001`), `subtotal`, `discount_amount`, `delivery_fee`, `total_amount`, `currency`, `payment_status` (`pending`, `created`, `paid`, `failed`, `refunded`, `partially_refunded`), `order_status` (`pending`, `confirmed`, `processing`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `returned`, `refunded`), `shipping_name`, `shipping_phone`, `shipping_address`, `shipping_area`, `shipping_city`, `shipping_state`, `shipping_pincode`, `created_at`, `updated_at`.
13. **`order_items`**: Historical order snapshot. `id`, `order_id`, `product_id`, `product_name`, `sku`, `quantity`, `unit_price`, `total_price`, `created_at`.
14. **`payments`**: Razorpay transaction logs. `id`, `order_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `amount`, `currency`, `status`, `method`, `error_code`, `error_description`, `created_at`, `updated_at`.
15. **`refunds`**: Payment refund tracking. `id`, `payment_id`, `razorpay_refund_id`, `amount`, `status`, `reason`, `created_at`.
16. **`coupons`**: Discount promotions. `id`, `code` (unique), `description`, `discount_type` (`percentage` | `fixed`), `discount_value`, `minimum_order_amount`, `maximum_discount`, `usage_limit`, `used_count`, `valid_from`, `valid_until`, `is_active`, `created_at`.
17. **`coupon_usage`**: Per-user coupon redemption history. `id`, `coupon_id`, `user_id`, `order_id`, `discount_applied`, `used_at`.
18. **`suppliers`**: Wholesalers / vendors. `id`, `business_name`, `contact_name`, `phone`, `email`, `address`, `city`, `state`, `pincode`, `gst_number`, `notes`, `is_active`, `created_at`, `updated_at`.
19. **`supplier_products`**: Sourcing catalog. `id`, `supplier_id`, `product_id`, `supplier_sku`, `cost_price`, `minimum_order_quantity`, `lead_time_days`, `created_at`, `updated_at`.
20. **`purchase_orders`**: B2B procurement records. `id`, `supplier_id`, `purchase_order_number` (unique), `status` (`draft`, `ordered`, `partially_received`, `received`, `cancelled`), `subtotal`, `tax`, `total_amount`, `expected_delivery_date`, `created_at`, `updated_at`.
21. **`purchase_order_items`**: Procurement line items. `id`, `purchase_order_id`, `product_id`, `quantity_ordered`, `quantity_received`, `unit_cost`, `total_cost`.
22. **`reviews`**: Verified customer reviews. `id`, `product_id`, `user_id`, `order_id`, `rating` (1-5), `review_text`, `is_approved`, `created_at`, `updated_at`.
23. **`delivery_config`**: Service area and pricing configuration. `id`, `city`, `delivery_fee`, `free_delivery_threshold`, `serviceable_pincodes`, `is_active`, `updated_at`.

---

## 4. Security & Row Level Security (RLS) Architecture

### 4.1 Zero-Trust Client Model
* The frontend is treated as untrusted. Client-provided prices, subtotals, or payment statuses are never accepted blindly.
* `cost_price` in the `products` table and all supplier/purchase order records are strictly restricted to users with `role = 'admin'`. Normal customers query a safe view `public_products` or column-filtered queries where `cost_price` is omitted.
* Service role secrets and `RAZORPAY_KEY_SECRET` never leave Supabase Edge Functions.

### 4.2 Customer Isolation Policies
* `profiles`: Users can select and update only their own profile (`auth.uid() = id`). Admins can read all profiles.
* `addresses`: Users can select, insert, update, and delete only their own addresses (`auth.uid() = user_id`).
* `carts` & `cart_items`: Users can only access carts where `user_id = auth.uid()`.
* `wishlist` & `wishlist_items`: Users can only access wishlist where `user_id = auth.uid()`.
* `orders` & `order_items`: Customers can only view orders where `user_id = auth.uid()`.
* `payments`: Customers can only view payment records associated with their own orders.

### 4.3 Admin Security Verification
An explicit SQL security helper function `is_admin()` checks:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN SECURITY DEFINER STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;
```
RLS policies for administrative tables (`suppliers`, `supplier_products`, `purchase_orders`, `purchase_order_items`, `coupons` management) enforce `is_admin() = true`.

---

## 5. Payment & Inventory Processing Flow

```text
[Frontend Cart]
       │
       ▼ (1) Click "Proceed to Checkout"
[Edge Function: create-razorpay-order]
       ├─ Validates user token & addresses
       ├─ Queries active products & current selling prices from DB
       ├─ Checks inventory availability: available_quantity >= requested
       ├─ Validates coupon code and calculates discount limit
       ├─ Calculates delivery fee (₹79 or FREE if >= ₹999)
       ├─ Creates pending order record with order_number (JIVVI-2026-XXXXXX)
       ├─ Calls Razorpay API: /v1/orders (amount in paise)
       └─ Returns { orderId, razorpayOrderId, amount, currency, keyId }
       │
       ▼ (2) Razorpay Checkout Modal opens in client browser
[Customer pays via UPI / Card / NetBanking]
       │
       ▼ (3) Client receives payment response (razorpay_payment_id, signature)
[Edge Function: verify-razorpay-payment]
       ├─ Computes expected HMAC-SHA256: crypto.subtle.sign(order_id + "|" + payment_id, secret)
       ├─ Compares signature in constant time
       ├─ If valid:
       │    ├─ Calls atomic DB RPC: complete_order_payment(...)
       │    ├─ Marks payment as 'paid', order as 'confirmed'
       │    ├─ Atomically decrements product stock & inventory quantity
       │    ├─ Increments coupon used_count and logs coupon_usage
       │    └─ Clears customer cart_items
       └─ Returns { success: true, orderNumber, status: 'confirmed' }
       │
       ▼ (4) Confirmation view renders with details & receipt
```

---

## 6. Asynchronous Webhook Idempotency

In addition to frontend callback verification, Razorpay sends asynchronous webhooks to `supabase/functions/razorpay-webhook`.
* Webhook signature (`X-Razorpay-Signature`) is verified against `RAZORPAY_WEBHOOK_SECRET`.
* Event processing is idempotent:
  * If `payment.captured` arrives and the order is already marked `confirmed`, the webhook safely acknowledges with HTTP 200 without duplicate inventory deductions.
  * If the frontend callback dropped due to network failure, the webhook performs the final order confirmation and inventory decrement.
