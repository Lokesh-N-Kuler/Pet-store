-- ==============================================================================
-- JIVVI E-COMMERCE INVENTORY & CONCURRENCY CONTROLS
-- Migration: 003_inventory_and_functions.sql
-- Description: Automated inventory sync, atomic reservation, and deduction RPCs.
-- ==============================================================================

-- 1. Automatic trigger to create inventory row when a new product is created
CREATE OR REPLACE FUNCTION public.sync_new_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.inventory (product_id, quantity, reserved_quantity)
  VALUES (NEW.id, NEW.stock_quantity, 0)
  ON CONFLICT (product_id) DO UPDATE SET
    quantity = EXCLUDED.quantity;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_new_product_inventory ON public.products;
CREATE TRIGGER trg_new_product_inventory
  AFTER INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.sync_new_product_inventory();

-- 2. Trigger to keep products.stock_quantity in sync when inventory.quantity changes
CREATE OR REPLACE FUNCTION public.sync_inventory_to_product()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_inventory_to_product ON public.inventory;
CREATE TRIGGER trg_sync_inventory_to_product
  AFTER UPDATE OF quantity ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_to_product();

-- 3. Atomic stock check function
CREATE OR REPLACE FUNCTION public.check_stock_availability(p_product_id UUID, p_requested_quantity INT)
RETURNS BOOLEAN
SECURITY DEFINER STABLE
AS $$
DECLARE
  v_available INT;
BEGIN
  SELECT available_quantity INTO v_available
  FROM public.inventory
  WHERE product_id = p_product_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN v_available >= p_requested_quantity;
END;
$$ LANGUAGE plpgsql;

-- 4. Atomic stock deduction for confirmed orders
CREATE OR REPLACE FUNCTION public.deduct_order_inventory(p_order_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Lock inventory rows for all items in the order to prevent race conditions
  FOR item IN
    SELECT product_id, quantity, product_name
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    -- Check availability under row lock
    IF NOT EXISTS (
      SELECT 1 FROM public.inventory
      WHERE product_id = item.product_id AND available_quantity >= item.quantity
      FOR UPDATE
    ) THEN
      RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK: Item "%" is out of stock or insufficient quantity available.', item.product_name;
    END IF;

    -- Atomically decrement stock
    UPDATE public.inventory
    SET quantity = quantity - item.quantity,
        updated_at = now()
    WHERE product_id = item.product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Atomic release of reserved inventory if an order is cancelled or expires
CREATE OR REPLACE FUNCTION public.release_order_inventory(p_order_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE public.inventory
    SET quantity = quantity + item.quantity,
        updated_at = now()
    WHERE product_id = item.product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
