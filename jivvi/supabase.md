# JIVVI — Supabase Technical Reference & Operations Manual

This document is the canonical reference for the JIVVI Supabase backend: PostgreSQL database schema, Row Level Security (RLS) rules, Edge Functions, Storage buckets, Auth integration, and operations.

---

## 1. Supabase Project Structure

```text
supabase/
├── config.toml                 # Local Supabase CLI configuration
├── migrations/
│   ├── 001_initial_schema.sql  # Normalized table schemas, types, and indexes
│   ├── 002_rls_policies.sql    # Row Level Security policies for all tables
│   ├── 003_inventory_and_functions.sql # Inventory sync triggers & atomic reservation
│   ├── 004_orders_and_checkout.sql     # Order sequencing & coupon validation RPC
│   ├── 005_payments_and_razorpay.sql   # Razorpay payments, signatures & order completion RPC
│   └── 006_suppliers_and_procurement.sql # Procurement & PO receiving stock replenishment
├── functions/
│   ├── create-razorpay-order/  # Edge Function: server-calculated Razorpay order creation
│   │   └── index.ts
│   ├── verify-razorpay-payment/# Edge Function: HMAC-SHA256 signature verification & fulfillment
│   │   └── index.ts
│   ├── razorpay-webhook/       # Edge Function: async webhook receiver for payment/refund events
│   │   └── index.ts
│   └── apply-coupon/           # Edge Function: coupon eligibility & discount calculation
│       └── index.ts
└── seed.sql                    # Initial categories, brands, products, inventory & coupons
```

---

## 2. PostgreSQL Tables & Relationships

| Table Name | Primary Key | Foreign Keys / References | Description |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `id UUID` | `auth.users(id) ON DELETE CASCADE` | User metadata (`full_name`, `email`, `phone`, `role`, `avatar_url`) |
| **`addresses`** | `id UUID` | `profiles(id) ON DELETE CASCADE` | Shipping addresses with default indicator |
| **`categories`** | `id UUID` | None | Product categories (`name`, `slug`, `pet_type`, `is_active`) |
| **`brands`** | `id UUID` | None | Manufacturer/brand partners (`name`, `slug`, `logo_url`) |
| **`products`** | `id UUID` | `categories(id)`, `brands(id)` | Master catalog (`sku`, `cost_price` [PRIVATE], `price`, `sale_price`, `stock_quantity`, `weight`) |
| **`product_images`** | `id UUID` | `products(id) ON DELETE CASCADE` | Product photo gallery (`image_url`, `alt_text`, `display_order`) |
| **`inventory`** | `id UUID` | `products(id) ON DELETE CASCADE` | Real-time stock (`quantity`, `reserved_quantity`, `available_quantity`) |
| **`wishlist`** | `id UUID` | `profiles(id) ON DELETE CASCADE` | Customer wishlist header (1:1 with user) |
| **`wishlist_items`**| `id UUID` | `wishlist(id)`, `products(id)` | Wishlist line items |
| **`carts`** | `id UUID` | `profiles(id) ON DELETE CASCADE` | Customer shopping basket (1:1 with user) |
| **`cart_items`** | `id UUID` | `carts(id)`, `products(id)` | Cart line items with quantities |
| **`orders`** | `id UUID` | `profiles(id)` | Orders (`order_number`, `total_amount`, `payment_status`, `order_status`, shipping address) |
| **`order_items`** | `id UUID` | `orders(id)`, `products(id)` | Historical line items with immutable price & name snapshots |
| **`payments`** | `id UUID` | `orders(id)` | Razorpay transaction records (`razorpay_order_id`, `razorpay_payment_id`, `status`) |
| **`refunds`** | `id UUID` | `payments(id)` | Payment refund records (`razorpay_refund_id`, `amount`, `status`, `reason`) |
| **`coupons`** | `id UUID` | None | Promotional discount codes (`code`, `discount_type`, `discount_value`, `minimum_order_amount`, caps, validity) |
| **`coupon_usage`** | `id UUID` | `coupons(id)`, `profiles(id)`, `orders(id)` | Usage logs preventing promo code abuse |
| **`suppliers`** | `id UUID` | None | Wholesaler directory (`business_name`, `contact_name`, `phone`, `gst_number`) |
| **`supplier_products`**| `id UUID`| `suppliers(id)`, `products(id)` | Supplier catalog mappings with cost prices |
| **`purchase_orders`**| `id UUID`| `suppliers(id)` | B2B Procurement orders (`purchase_order_number`, `status`, `total_amount`) |
| **`purchase_order_items`**| `id UUID`| `purchase_orders(id)`, `products(id)` | Procurement items with quantity ordered/received |
| **`reviews`** | `id UUID` | `products(id)`, `profiles(id)`, `orders(id)` | Verified purchaser ratings and reviews |
| **`delivery_config`**| `id UUID`| None | Configurable city delivery rates & thresholds |

---

## 3. Row Level Security (RLS) Matrix

| Table | Public / Guest Access | Customer (Authenticated) | Admin (`role = 'admin'`) |
| :--- | :--- | :--- | :--- |
| **`profiles`** | None | Read & Update own record (`auth.uid() = id`) | Full CRUD across all profiles |
| **`addresses`** | None | Full CRUD on own addresses (`user_id = auth.uid()`) | Full CRUD |
| **`categories`**| Read active only (`is_active = true`)| Read active only | Full CRUD |
| **`brands`** | Read active only (`is_active = true`)| Read active only | Full CRUD |
| **`products`** | Read active via `public_products` view (`cost_price` masked)| Read active via view | Full CRUD on master table including `cost_price` |
| **`product_images`**| Read all | Read all | Full CRUD |
| **`inventory`** | None (Stock reads via product available flag)| Read via product availability | Full CRUD & manual adjustments |
| **`carts`** | None | Full CRUD on own cart (`user_id = auth.uid()`) | Full CRUD |
| **`cart_items`** | None | Full CRUD on own items | Full CRUD |
| **`wishlist`** | None | Full CRUD on own wishlist | Full CRUD |
| **`wishlist_items`**| None | Full CRUD on own items | Full CRUD |
| **`orders`** | None | Read own orders (`user_id = auth.uid()`) | Full CRUD & status updates |
| **`order_items`** | None | Read own order items | Full CRUD |
| **`payments`** | None | Read payments for own orders | Full CRUD |
| **`refunds`** | None | Read refunds for own payments | Full CRUD & refund creation |
| **`coupons`** | Read active valid coupons | Read active valid coupons | Full CRUD |
| **`coupon_usage`**| None | Read own redemptions | Full CRUD |
| **`suppliers`** | None | None | Full CRUD |
| **`supplier_products`**| None | None | Full CRUD |
| **`purchase_orders`**| None | None | Full CRUD |
| **`purchase_order_items`**| None | None | Full CRUD |
| **`reviews`** | Read approved reviews (`is_approved = true`)| Read approved; Create review if purchased | Full CRUD & moderation |
| **`delivery_config`**| Read active config | Read active config | Full CRUD |

---

## 4. Supabase Storage Buckets & Policies

| Bucket Name | Public Access | Allowed MIME Types | File Size Limit | Upload Authorization |
| :--- | :--- | :--- | :--- | :--- |
| **`product-images`** | Public Read | `image/jpeg`, `image/png`, `image/webp` | 5 MB | Admin only (`is_admin() = true`) |
| **`category-images`**| Public Read | `image/jpeg`, `image/png`, `image/webp` | 5 MB | Admin only |
| **`brand-images`** | Public Read | `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` | 2 MB | Admin only |
| **`avatars`** | Public Read | `image/jpeg`, `image/png`, `image/webp` | 2 MB | Authenticated users (own folder: `avatars/{user_id}/*`) |

---

## 5. Supabase Edge Functions Reference

### 5.1 `create-razorpay-order`
* **Trigger:** Invoked by client at checkout confirmation.
* **Payload:** `{ addressId, couponCode, items: [{ productId, quantity }] }`
* **Operations:**
  1. Validates user JWT.
  2. Queries active product prices from PostgreSQL.
  3. Checks `inventory.available_quantity >= quantity` for all items.
  4. Validates coupon eligibility and calculates capped discount.
  5. Computes Bengaluru delivery fee (₹79 or FREE for orders >= ₹999).
  6. Generates pending order with formatted order number (`JIVVI-2026-XXXXXX`).
  7. Invokes Razorpay Orders API: `POST https://api.razorpay.com/v1/orders`.
* **Returns:** `{ orderId, orderNumber, razorpayOrderId, amount, currency, keyId }`

### 5.2 `verify-razorpay-payment`
* **Trigger:** Invoked by client immediately upon Razorpay modal payment callback.
* **Payload:** `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`
* **Operations:**
  1. Computes `HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET)`.
  2. Constant-time comparison with `razorpaySignature`.
  3. Calls PostgreSQL RPC function `complete_order_payment(...)`.
  4. Updates payment to `paid`, order to `confirmed`.
  5. Atomically deducts inventory stock and clears user's cart.
* **Returns:** `{ success: true, orderNumber, status: 'confirmed' }`

### 5.3 `razorpay-webhook`
* **Trigger:** Asynchronous HTTPS POST from Razorpay servers.
* **Headers:** `X-Razorpay-Signature`
* **Operations:**
  1. Verifies payload signature against `RAZORPAY_WEBHOOK_SECRET`.
  2. Handles `payment.captured` idempotently.
  3. Handles `payment.failed`, updating order to `cancelled` and releasing reserved inventory.
  4. Handles `refund.created` and `refund.processed`.
* **Returns:** HTTP 200 `{ status: "ok" }`

### 5.4 `apply-coupon`
* **Trigger:** Invoked when customer clicks "Apply Coupon" in Checkout Modal.
* **Payload:** `{ code, subtotal }`
* **Operations:** Validates coupon active status, start/end dates, minimum order value, usage limits, and calculates exact discount in INR.
* **Returns:** `{ valid: true, discountAmount, finalAmount, message }`

---

## 6. Environment Variables Configuration

### Frontend Client (`jivvi/.env`):
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

### Supabase Edge Functions Secrets:
```bash
# Set via Supabase CLI or Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
```

---

## 7. Creating an Administrator Account

Administrators cannot be created through standard public registration. Follow this procedure:

1. Register the administrator email via standard signup in the JIVVI storefront.
2. Open the Supabase Dashboard -> **SQL Editor**.
3. Run the secure elevation query:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@jivvi.com';
   ```
4. Confirm role update:
   ```sql
   SELECT id, full_name, email, role FROM public.profiles WHERE role = 'admin';
   ```
5. The administrator can now log in and access the **Admin Dashboard** in the top navigation.

---

## 8. Backup & Production Security Considerations

1. **Daily Automated Backups:** Enable daily physical backups and point-in-time recovery (PITR) in Supabase Pro/Team tier.
2. **Database Connection Pooling:** Use Supabase PgBouncer connection pooling (port `6543`) for serverless Edge Functions to prevent connection exhaustion.
3. **Secret Rotation:** Store Razorpay keys in Supabase Vault and rotate webhook secrets annually.
4. **SSL / TLS Enforcement:** All API, Webhook, and Frontend connections must enforce TLS 1.3.
