-- ==============================================================================
-- JIVVI E-COMMERCE ORDERS & CHECKOUT RPC FUNCTIONS
-- Migration: 004_orders_and_checkout.sql
-- Description: Server-side price recalculation, coupon evaluation, and order creation.
-- ==============================================================================

-- 1. Helper function to generate standardized human-friendly order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_seq BIGINT;
  v_year TEXT;
BEGIN
  v_seq := nextval('order_number_seq');
  v_year := to_char(now(), 'YYYY');
  RETURN 'JIVVI-' || v_year || '-' || lpad(v_seq::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Server-side coupon evaluation function
CREATE OR REPLACE FUNCTION public.evaluate_coupon(
  p_code TEXT,
  p_subtotal NUMERIC,
  p_user_id UUID
)
RETURNS TABLE (
  valid BOOLEAN,
  coupon_id UUID,
  discount_amount NUMERIC,
  message TEXT
)
SECURITY DEFINER STABLE
AS $$
DECLARE
  v_coupon RECORD;
  v_calculated_discount NUMERIC(10, 2) := 0.00;
  v_already_used BOOLEAN;
BEGIN
  -- Lookup coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE upper(code) = upper(trim(p_code)) AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0.00::NUMERIC, 'Invalid coupon code.'::TEXT;
    RETURN;
  END IF;

  -- Date validity check
  IF now() < v_coupon.valid_from OR now() > v_coupon.valid_until THEN
    RETURN QUERY SELECT false, NULL::UUID, 0.00::NUMERIC, 'This coupon has expired.'::TEXT;
    RETURN;
  END IF;

  -- Minimum purchase check
  IF p_subtotal < v_coupon.minimum_order_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, 0.00::NUMERIC,
      ('Minimum order amount of ₹' || v_coupon.minimum_order_amount::TEXT || ' required.')::TEXT;
    RETURN;
  END IF;

  -- Global usage limit check
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, 0.00::NUMERIC, 'Coupon usage limit has been reached.'::TEXT;
    RETURN;
  END IF;

  -- Per-user usage check (if user is provided)
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.coupon_usage
      WHERE coupon_id = v_coupon.id AND user_id = p_user_id
    ) INTO v_already_used;

    IF v_already_used THEN
      RETURN QUERY SELECT false, NULL::UUID, 0.00::NUMERIC, 'You have already redeemed this coupon.'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Calculate discount value
  IF v_coupon.discount_type = 'percentage' THEN
    v_calculated_discount := round((p_subtotal * (v_coupon.discount_value / 100.0)), 2);
    IF v_coupon.maximum_discount IS NOT NULL AND v_calculated_discount > v_coupon.maximum_discount THEN
      v_calculated_discount := v_coupon.maximum_discount;
    END IF;
  ELSE
    -- Fixed amount discount
    v_calculated_discount := v_coupon.discount_value;
    IF v_calculated_discount > p_subtotal THEN
      v_calculated_discount := p_subtotal;
    END IF;
  END IF;

  RETURN QUERY SELECT true, v_coupon.id, v_calculated_discount, 'Coupon applied successfully!'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 3. Atomic pending order creation RPC
CREATE OR REPLACE FUNCTION public.create_pending_checkout_order(
  p_shipping_name TEXT,
  p_shipping_phone TEXT,
  p_shipping_address TEXT,
  p_shipping_area TEXT,
  p_shipping_city TEXT,
  p_shipping_state TEXT,
  p_shipping_pincode TEXT,
  p_coupon_code TEXT,
  p_items JSONB,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_product RECORD;
  v_subtotal NUMERIC(10, 2) := 0.00;
  v_discount NUMERIC(10, 2) := 0.00;
  v_delivery_fee NUMERIC(10, 2) := 79.00;
  v_free_delivery_threshold NUMERIC(10, 2) := 999.00;
  v_total NUMERIC(10, 2) := 0.00;
  v_coupon_eval RECORD;
  v_effective_unit_price NUMERIC(10, 2);
  v_item_total NUMERIC(10, 2);
  v_order_items_to_insert JSONB := '[]'::JSONB;
BEGIN
  -- Authenticate caller (supports direct user JWT or trusted Edge Function with p_user_id)
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERR_UNAUTHORIZED: Customer must be logged in to create an order.';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'ERR_EMPTY_CART: Cannot checkout with an empty cart.';
  END IF;

  -- Read delivery configuration
  SELECT delivery_fee, free_delivery_threshold
  INTO v_delivery_fee, v_free_delivery_threshold
  FROM public.delivery_config
  WHERE is_active = true
  LIMIT 1;

  -- Iterate through items and calculate verified subtotal from database prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, name, sku, price, sale_price, stock_quantity, is_active
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID;

    IF NOT FOUND OR v_product.is_active = false THEN
      RAISE EXCEPTION 'ERR_INVALID_PRODUCT: Product % is no longer available.', (v_item->>'product_id');
    END IF;

    -- Check availability
    IF (v_item->>'quantity')::INT > v_product.stock_quantity THEN
      RAISE EXCEPTION 'ERR_OUT_OF_STOCK: Insufficient stock for % (Available: %)', v_product.name, v_product.stock_quantity;
    END IF;

    -- Use active sale_price if available, otherwise standard price
    v_effective_unit_price := COALESCE(v_product.sale_price, v_product.price);
    v_item_total := v_effective_unit_price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_item_total;

    v_order_items_to_insert := v_order_items_to_insert || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'sku', v_product.sku,
      'quantity', (v_item->>'quantity')::INT,
      'unit_price', v_effective_unit_price,
      'total_price', v_item_total
    );
  END LOOP;

  -- Evaluate Coupon if present
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) != '' THEN
    SELECT * INTO v_coupon_eval
    FROM public.evaluate_coupon(p_coupon_code, v_subtotal, v_user_id);

    IF v_coupon_eval.valid THEN
      v_discount := v_coupon_eval.discount_amount;
    END IF;
  END IF;

  -- Apply free delivery threshold
  IF v_subtotal >= v_free_delivery_threshold THEN
    v_delivery_fee := 0.00;
  END IF;

  v_total := (v_subtotal - v_discount) + v_delivery_fee;
  IF v_total < 0 THEN
    v_total := 0.00;
  END IF;

  -- Generate order number
  v_order_number := public.generate_order_number();

  -- Insert order
  INSERT INTO public.orders (
    user_id,
    order_number,
    subtotal,
    discount_amount,
    delivery_fee,
    total_amount,
    currency,
    payment_status,
    order_status,
    shipping_name,
    shipping_phone,
    shipping_address,
    shipping_area,
    shipping_city,
    shipping_state,
    shipping_pincode
  ) VALUES (
    v_user_id,
    v_order_number,
    v_subtotal,
    v_discount,
    v_delivery_fee,
    v_total,
    'INR',
    'pending',
    'pending',
    p_shipping_name,
    p_shipping_phone,
    p_shipping_address,
    p_shipping_area,
    COALESCE(p_shipping_city, 'Bengaluru'),
    COALESCE(p_shipping_state, 'Karnataka'),
    p_shipping_pincode
  ) RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_items_to_insert)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      v_item->>'sku',
      (v_item->>'quantity')::INT,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'total_price')::NUMERIC
    );
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'delivery_fee', v_delivery_fee,
    'total_amount', v_total,
    'currency', 'INR'
  );
END;
$$ LANGUAGE plpgsql;
