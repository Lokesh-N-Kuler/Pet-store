-- ==============================================================================
-- JIVVI E-COMMERCE PROCUREMENT & ADMIN METRICS
-- Migration: 006_suppliers_and_procurement.sql
-- Description: Purchase order receiving inventory replenishment and admin KPI function.
-- ==============================================================================

-- 1. Helper to generate PO numbers (e.g. PO-2026-00001)
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT AS $$
DECLARE
  v_seq BIGINT;
  v_year TEXT;
BEGIN
  v_seq := nextval('po_number_seq');
  v_year := to_char(now(), 'YYYY');
  RETURN 'PO-' || v_year || '-' || lpad(v_seq::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger to replenish inventory when a Purchase Order status is updated to 'received'
CREATE OR REPLACE FUNCTION public.handle_purchase_order_received()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Only trigger when transitioning into 'received'
  IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
    FOR v_item IN
      SELECT product_id, quantity_ordered, quantity_received
      FROM public.purchase_order_items
      WHERE purchase_order_id = NEW.id
    LOOP
      -- Increment inventory quantity
      UPDATE public.inventory
      SET quantity = quantity + v_item.quantity_ordered,
          updated_at = now()
      WHERE product_id = v_item.product_id;

      -- Update quantity_received on purchase order line items
      UPDATE public.purchase_order_items
      SET quantity_received = quantity_ordered
      WHERE purchase_order_id = NEW.id AND product_id = v_item.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_po_received_stock ON public.purchase_orders;
CREATE TRIGGER trg_po_received_stock
  AFTER UPDATE OF status ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_purchase_order_received();

-- 3. Executive Admin Dashboard KPI Metrics Function
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS JSONB
SECURITY DEFINER STABLE
AS $$
DECLARE
  v_total_orders BIGINT;
  v_today_orders BIGINT;
  v_total_revenue NUMERIC(12, 2);
  v_pending_orders BIGINT;
  v_total_products BIGINT;
  v_low_stock_products BIGINT;
  v_total_customers BIGINT;
BEGIN
  -- Security check: only admins can call
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ERR_FORBIDDEN: Only administrators can view business metrics.';
  END IF;

  -- Total Orders
  SELECT count(*) INTO v_total_orders FROM public.orders;

  -- Today's Orders
  SELECT count(*) INTO v_today_orders
  FROM public.orders
  WHERE created_at >= date_trunc('day', now());

  -- Realized Revenue (Calculated ONLY from confirmed and paid orders)
  SELECT COALESCE(sum(total_amount), 0.00) INTO v_total_revenue
  FROM public.orders
  WHERE payment_status = 'paid';

  -- Pending fulfillment
  SELECT count(*) INTO v_pending_orders
  FROM public.orders
  WHERE order_status IN ('pending', 'confirmed', 'processing', 'packed');

  -- Total active products
  SELECT count(*) INTO v_total_products
  FROM public.products
  WHERE is_active = true;

  -- Low stock alerts
  SELECT count(*) INTO v_low_stock_products
  FROM public.products
  WHERE is_active = true AND stock_quantity <= low_stock_threshold;

  -- Total registered customers
  SELECT count(*) INTO v_total_customers
  FROM public.profiles
  WHERE role = 'customer';

  RETURN jsonb_build_object(
    'total_orders', v_total_orders,
    'today_orders', v_today_orders,
    'total_revenue', v_total_revenue,
    'pending_orders', v_pending_orders,
    'total_products', v_total_products,
    'low_stock_products', v_low_stock_products,
    'total_customers', v_total_customers
  );
END;
$$ LANGUAGE plpgsql;
