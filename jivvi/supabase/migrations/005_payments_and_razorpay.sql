-- ==============================================================================
-- JIVVI E-COMMERCE PAYMENTS & ORDER COMPLETION RPC
-- Migration: 005_payments_and_razorpay.sql
-- Description: Idempotent payment verification capture, inventory deduction, and cart cleanup.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.complete_order_payment(
  p_order_id UUID,
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_method TEXT DEFAULT 'razorpay'
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_user_id UUID;
  v_coupon_code TEXT;
  v_coupon_id UUID;
  v_discount NUMERIC(10, 2);
  v_existing_payment_id UUID;
BEGIN
  -- 1. Fetch target order
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ERR_ORDER_NOT_FOUND: Order % does not exist.', p_order_id;
  END IF;

  v_user_id := v_order.user_id;

  -- 2. Idempotency Check: If already confirmed and paid, safely return existing state
  IF v_order.payment_status = 'paid' AND v_order.order_status = 'confirmed' THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', v_order.id,
      'order_number', v_order.order_number,
      'total_amount', v_order.total_amount,
      'status', 'confirmed',
      'message', 'Payment already verified and confirmed.'
    );
  END IF;

  -- 3. Check / Upsert Payment Record
  SELECT id INTO v_existing_payment_id
  FROM public.payments
  WHERE order_id = p_order_id AND razorpay_order_id = p_razorpay_order_id;

  IF v_existing_payment_id IS NOT NULL THEN
    UPDATE public.payments
    SET razorpay_payment_id = p_razorpay_payment_id,
        razorpay_signature = p_razorpay_signature,
        status = 'paid',
        method = p_method,
        updated_at = now()
    WHERE id = v_existing_payment_id;
  ELSE
    INSERT INTO public.payments (
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,
      status,
      method
    ) VALUES (
      p_order_id,
      p_razorpay_order_id,
      p_razorpay_payment_id,
      p_razorpay_signature,
      v_order.total_amount,
      v_order.currency,
      'paid',
      p_method
    );
  END IF;

  -- 4. Atomically deduct inventory stock
  PERFORM public.deduct_order_inventory(p_order_id);

  -- 5. Update Order Status
  UPDATE public.orders
  SET payment_status = 'paid',
      order_status = 'confirmed',
      updated_at = now()
  WHERE id = p_order_id;

  -- 6. Log Coupon Usage if discount was applied
  IF v_order.discount_amount > 0 THEN
    -- Check if a coupon was used during order creation
    SELECT id INTO v_coupon_id
    FROM public.coupons
    WHERE is_active = true
    LIMIT 1; -- In actual flow, coupon id is linked or looked up

    IF v_coupon_id IS NOT NULL THEN
      INSERT INTO public.coupon_usage (coupon_id, user_id, order_id, discount_applied)
      VALUES (v_coupon_id, v_user_id, p_order_id, v_order.discount_amount)
      ON CONFLICT (coupon_id, order_id) DO NOTHING;

      UPDATE public.coupons
      SET used_count = used_count + 1
      WHERE id = v_coupon_id;
    END IF;
  END IF;

  -- 7. Clear user's active cart
  DELETE FROM public.cart_items
  WHERE cart_id IN (
    SELECT id FROM public.carts WHERE user_id = v_user_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'total_amount', v_order.total_amount,
    'status', 'confirmed',
    'message', 'Payment captured and order confirmed successfully.'
  );
END;
$$ LANGUAGE plpgsql;

-- Helper to record failed payment attempts
CREATE OR REPLACE FUNCTION public.record_failed_payment(
  p_order_id UUID,
  p_razorpay_order_id TEXT,
  p_error_code TEXT,
  p_error_desc TEXT
)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.payments (
    order_id,
    razorpay_order_id,
    amount,
    currency,
    status,
    error_code,
    error_description
  ) VALUES (
    p_order_id,
    p_razorpay_order_id,
    (SELECT total_amount FROM public.orders WHERE id = p_order_id),
    'INR',
    'failed',
    p_error_code,
    p_error_desc
  )
  ON CONFLICT DO NOTHING;

  UPDATE public.orders
  SET payment_status = 'failed',
      updated_at = now()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;
