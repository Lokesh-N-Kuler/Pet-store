-- ==============================================================================
-- JIVVI E-COMMERCE DATABASE ROW LEVEL SECURITY POLICIES
-- Migration: 002_rls_policies.sql
-- Description: Complete zero-trust Row Level Security (RLS) enforcement.
-- ==============================================================================

-- Security definer function to check if current user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all customer-accessible and admin tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_config ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile (excluding role)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

CREATE POLICY "Admins have full CRUD on profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. ADDRESSES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES & BRANDS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full CRUD on categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can view active brands"
  ON public.brands FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full CRUD on brands"
  ON public.brands FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. PRODUCTS & PRODUCT IMAGES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full CRUD on products"
  ON public.products FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins have full CRUD on product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. INVENTORY POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public and customers can read inventory quantities"
  ON public.inventory FOR SELECT
  USING (true);

CREATE POLICY "Admins have full CRUD on inventory"
  ON public.inventory FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. WISHLIST POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage their own wishlist items"
  ON public.wishlist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlist w
      WHERE w.id = wishlist_items.wishlist_id AND (w.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlist w
      WHERE w.id = wishlist_items.wishlist_id AND (w.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------------------------
-- 7. CARTS & CART ITEMS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can manage their own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage their own cart items"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------------------------
-- 8. ORDERS & ORDER ITEMS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Users can view items of their own orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert order items for their own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------------------------
-- 9. PAYMENTS & REFUNDS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view payments for their own orders"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins have full CRUD on payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins have full CRUD on refunds"
  ON public.refunds FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. COUPONS & USAGE POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full CRUD on coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can view their own coupon usages"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 11. SUPPLIERS & PROCUREMENT (ADMIN ONLY)
-- ------------------------------------------------------------------------------
CREATE POLICY "Only admins can access suppliers"
  ON public.suppliers FOR ALL
  USING (public.is_admin());

CREATE POLICY "Only admins can access supplier products"
  ON public.supplier_products FOR ALL
  USING (public.is_admin());

CREATE POLICY "Only admins can access purchase orders"
  ON public.purchase_orders FOR ALL
  USING (public.is_admin());

CREATE POLICY "Only admins can access purchase order items"
  ON public.purchase_order_items FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 12. REVIEWS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Verified purchasers can write reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
        AND o.order_status NOT IN ('cancelled', 'refunded')
        AND oi.product_id = reviews.product_id
    )
  );

CREATE POLICY "Admins have full CRUD on reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13. DELIVERY CONFIG POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view delivery configurations"
  ON public.delivery_config FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full CRUD on delivery config"
  ON public.delivery_config FOR ALL
  USING (public.is_admin());
