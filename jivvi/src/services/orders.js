// ==============================================================================
// ORDERS SERVICE
// File: src/services/orders.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const ordersService = {
  /**
   * Get all historical orders for authenticated user
   */
  async getUserOrders(userId) {
    if (!isSupabaseConfigured || !userId) {
      // Local storage fallback for guest/demo orders
      const stored = localStorage.getItem("jivvi_demo_orders");
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          subtotal,
          discount_amount,
          delivery_fee,
          total_amount,
          currency,
          payment_status,
          order_status,
          shipping_name,
          shipping_address,
          shipping_city,
          shipping_pincode,
          created_at,
          order_items (
            id,
            product_id,
            product_name,
            sku,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error || !data) {
        const stored = localStorage.getItem("jivvi_demo_orders");
        return stored ? JSON.parse(stored) : [];
      }

      return data;
    } catch {
      const stored = localStorage.getItem("jivvi_demo_orders");
      return stored ? JSON.parse(stored) : [];
    }
  },

  /**
   * Admin: fetch all orders with status filter
   */
  async getAdminOrders(status = "all") {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase
        .from("orders")
        .select(`
          *,
          user:profiles (
            full_name,
            email,
            phone
          ),
          order_items (*)
        `)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("order_status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Admin fetch orders error:", err);
      return [];
    }
  },

  /**
   * Admin: update fulfillment status
   */
  async updateOrderStatus(orderId, newStatus) {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Admin update order status error:", err);
      throw err;
    }
  },
};
