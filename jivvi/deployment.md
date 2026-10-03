# JIVVI — Complete Production Deployment Guide

This guide details the step-by-step production deployment procedure for the JIVVI platform, connecting the React 19 storefront with the Supabase backend and the Razorpay payment infrastructure.

---

## 1. Target Architecture

```text
                             USERS / CUSTOMERS
                                     │
                                     ▼
                           JIVVI FRONTEND (SPA)
                     Hosted on Vercel / Netlify / Cloudflare
                     Custom Domain (e.g., https://jivvi.in)
                                     │
                                     ▼ HTTPS / TLS 1.3
                             SUPABASE PLATFORM
                 ┌───────────────────┼───────────────────┐
                 ▼                   ▼                   ▼
            PostgreSQL             Auth               Storage
           (Schema, RLS,       (GoTrue, JWT)       (CDN Images)
          RPC Functions)
                 │
                 ▼
          Edge Functions
      (Deno Serverless Runtime)
                 │
                 ▼ HTTPS API
             Razorpay
        (Payment Gateway)
```

---

## 2. Phase 1: Supabase Project Provisioning

1. Log in to [Supabase Console](https://supabase.com).
2. Click **New Project**:
   * **Project Name:** `jivvi-production`
   * **Database Password:** Generate and securely store a 24+ character password in your password manager.
   * **Region:** Select **South Asia (Mumbai)** (`ap-south-1`) for optimal low latency for Indian pet parents.
   * **Pricing Plan:** Pro Tier recommended for daily backups and automated failover.
3. Save your Project Settings:
   * **Project URL:** `https://<project-ref>.supabase.co`
   * **anon (public) Key:** `eyJhbGciOi...`
   * **service_role (secret) Key:** `eyJhbGciOi...` *(Keep secret; never add to frontend)*

---

## 3. Phase 2: Database Schema & Migrations

### Option A: Using the Supabase CLI (Recommended)
```bash
# Login to Supabase CLI
npx supabase login

# Link your local project
npx supabase link --project-ref <your-project-ref>

# Push all migrations in sequence
npx supabase db push

# Apply seed data for catalog initialization
npx supabase db execute --file supabase/seed.sql
```

### Option B: Using the Supabase SQL Editor
If deploying manually from the web dashboard:
1. Open **SQL Editor** in the Supabase dashboard.
2. Run the files in `supabase/migrations/` sequentially:
   * `001_initial_schema.sql`
   * `002_rls_policies.sql`
   * `003_inventory_and_functions.sql`
   * `004_orders_and_checkout.sql`
   * `005_payments_and_razorpay.sql`
   * `006_suppliers_and_procurement.sql`
3. Execute `supabase/seed.sql` to populate initial categories, brands, products, inventory, coupons, and delivery configurations.

---

## 4. Phase 3: Supabase Storage Buckets

1. In Supabase Dashboard, navigate to **Storage**.
2. Verify or create the 4 required buckets:
   * `product-images` (Public: **Yes**)
   * `category-images` (Public: **Yes**)
   * `brand-images` (Public: **Yes**)
   * `avatars` (Public: **Yes**)
3. Upload initial category banners and product photography assets.
4. Verify that Row Level Security policies from `002_rls_policies.sql` restrict uploads to administrators (for catalog) and authenticated owners (for avatars).

---

## 5. Phase 4: Supabase Edge Functions Deployment

Deploy the four server-side payment and checkout functions:

```bash
# 1. Set environment secrets for Edge Functions
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
npx supabase secrets set RAZORPAY_KEY_SECRET=your_production_razorpay_secret
npx supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret

# 2. Deploy Edge Functions
npx supabase functions deploy create-razorpay-order --no-verify-jwt
npx supabase functions deploy verify-razorpay-payment --no-verify-jwt
npx supabase functions deploy razorpay-webhook --no-verify-jwt
npx supabase functions deploy apply-coupon --no-verify-jwt
```

---

## 6. Phase 5: Razorpay Dashboard Configuration

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Complete full KYC verification for your business entity.
3. Switch from **Test Mode** to **Live Mode**.
4. Generate API Keys (**Settings → API Keys → Generate Key**):
   * Save `RAZORPAY_KEY_ID` (starts with `rzp_live_`)
   * Save `RAZORPAY_KEY_SECRET`
5. Configure Webhooks (**Settings → Webhooks → Add New Webhook**):
   * **Webhook URL:** `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`
   * **Secret:** Enter a strong random secret and add it to `RAZORPAY_WEBHOOK_SECRET` in Supabase.
   * **Active Events to subscribe:**
     * `payment.captured`
     * `payment.failed`
     * `refund.created`
     * `refund.processed`

---

## 7. Phase 6: Frontend Environment Variables & Build

### Configure Environment Variables
In your hosting provider dashboard (or local `.env.production`):

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...<your-anon-key>...
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
```

> [!CAUTION]
> NEVER put `RAZORPAY_KEY_SECRET` or Supabase `service_role` key in frontend environment variables. Only public identifiers belong here.

### Test Local Production Build
```bash
cd d:\Jivvi\jivvi
npm run build
```
Verify that the output bundle builds without errors into `dist/`.

---

## 8. Phase 7: Frontend Hosting Deployment (Vercel / Netlify)

### Deploying to Vercel:
```bash
# Using Vercel CLI from project root
cd d:\Jivvi\jivvi
vercel --prod
```

Or connect your GitHub repository in the Vercel Dashboard:
* **Framework Preset:** Vite
* **Root Directory:** `jivvi`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Environment Variables:** Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_RAZORPAY_KEY_ID`.

### Configure SPA Rewrites (`vercel.json`):
Ensure all client paths route to `index.html`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 9. Phase 8: Custom Domain & SSL

1. In Vercel / Netlify domain settings, add your custom domain (e.g. `jivvi.in` and `www.jivvi.in`).
2. Add DNS A and CNAME records at your DNS registrar (GoDaddy, Namecheap, Cloudflare).
3. Wait for automated SSL certificate issuance (Let's Encrypt TLS 1.3).
4. Update Supabase Authentication URL Configuration:
   * Go to **Supabase Dashboard → Authentication → URL Configuration**.
   * Set **Site URL** to `https://jivvi.in`.
   * Add redirect URLs: `https://jivvi.in/**` and `http://localhost:5173/**` for development.

---

## 10. Phase 9: Production Verification Checklist

Execute the complete end-to-end shopping flow in production:

1. [ ] Storefront loads over HTTPS with valid SSL certificate.
2. [ ] Catalog loads active products from Supabase database.
3. [ ] Search & category filters return accurate matching products.
4. [ ] Cart drawer updates quantities with live stock checks.
5. [ ] User registration creates a new user in `auth.users` and automatically provisions a profile in `profiles`.
6. [ ] Customer can add and save a Bengaluru shipping address.
7. [ ] Applying coupon `WELCOME10` computes the verified discount server-side.
8. [ ] Clicking "Proceed to Checkout" invokes `create-razorpay-order` and opens the Razorpay popup.
9. [ ] Completing test/live payment triggers `verify-razorpay-payment`, marking payment `paid` and order `confirmed`.
10. [ ] Inventory decreases by the exact ordered item quantity.
11. [ ] Customer receives the Order Confirmation Modal with a unique order number (`JIVVI-2026-XXXXXX`).
12. [ ] Admin logs in, opens Admin Dashboard, views the new order, and updates status to `processing` → `shipped`.
13. [ ] Customer sees the updated status in their Customer Account order tracking view.
