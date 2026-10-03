// ==============================================================================
// ADMIN SERVICE
// File: src/services/admin.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const adminService = {
  /**
   * Fetch executive dashboard metrics
   */
  async getMetrics() {
    if (!isSupabaseConfigured) {
      return {
        total_orders: 48,
        today_orders: 6,
        total_revenue: 68450.00,
        pending_orders: 5,
        total_products: 12,
        low_stock_products: 2,
        total_customers: 142,
      };
    }

    try {
      const { data, error } = await supabase.rpc("get_admin_dashboard_metrics");
      if (error || !data) {
        return {
          total_orders: 0,
          today_orders: 0,
          total_revenue: 0,
          pending_orders: 0,
          total_products: 0,
          low_stock_products: 0,
          total_customers: 0,
        };
      }
      return data;
    } catch (err) {
      console.warn("Could not fetch admin metrics:", err);
      return {
        total_orders: 0,
        today_orders: 0,
        total_revenue: 0,
        pending_orders: 0,
        total_products: 0,
        low_stock_products: 0,
        total_customers: 0,
      };
    }
  },

  /**
   * Fetch full product catalog including confidential cost prices
   */
  async getProducts() {
    if (!isSupabaseConfigured) {
      return [
        { id: "p1", name: "Wild Alaskan Salmon Dry Kibble", sku: "JIV-DOG-001", cost_price: 950, price: 1899, sale_price: 1499, stock_quantity: 45, low_stock_threshold: 10, is_active: true },
        { id: "p2", name: "Tuna & Chicken Puree Treats", sku: "JIV-CAT-002", cost_price: 280, price: 650, sale_price: 499, stock_quantity: 80, low_stock_threshold: 15, is_active: true },
        { id: "p3", name: "ToughFlex Dental Chew Bone", sku: "JIV-DOG-003", cost_price: 290, price: 799, sale_price: 599, stock_quantity: 65, low_stock_threshold: 10, is_active: true },
        { id: "p4", name: "CloudRest Orthopedic Bed", sku: "JIV-DOG-007", cost_price: 1350, price: 3299, sale_price: 2499, stock_quantity: 4, low_stock_threshold: 5, is_active: true },
      ];
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name),
          brand:brands(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Admin fetch products error:", err);
      return [];
    }
  },

  /**
   * Update or create product
   */
  async saveProduct(product) {
    if (!isSupabaseConfigured) return { success: true };

    try {
      if (product.id) {
        const { error } = await supabase
          .from("products")
          .update({
            name: product.name,
            price: Number(product.price),
            sale_price: product.sale_price ? Number(product.sale_price) : null,
            cost_price: Number(product.cost_price || 0),
            stock_quantity: Number(product.stock_quantity),
            low_stock_threshold: Number(product.low_stock_threshold || 5),
            is_active: product.is_active,
            is_featured: product.is_featured || false,
          })
          .eq("id", product.id);

        if (error) throw error;
      } else {
        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const { error } = await supabase.from("products").insert({
          name: product.name,
          slug,
          sku: product.sku || `JIV-${Date.now().toString().slice(-6)}`,
          price: Number(product.price),
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          cost_price: Number(product.cost_price || 0),
          stock_quantity: Number(product.stock_quantity || 0),
          low_stock_threshold: Number(product.low_stock_threshold || 5),
          is_active: true,
        });

        if (error) throw error;
      }
      return { success: true };
    } catch (err) {
      console.error("Admin save product error:", err);
      throw err;
    }
  },

  /**
   * Adjust inventory stock count
   */
  async updateStock(productId, newQuantity) {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { error } = await supabase
        .from("inventory")
        .update({ quantity: Number(newQuantity) })
        .eq("product_id", productId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Admin update stock error:", err);
      throw err;
    }
  },

  /**
   * Fetch suppliers list
   */
  async getSuppliers() {
    if (!isSupabaseConfigured) {
      return [
        { id: "s1", business_name: "Karnataka Pet Wholesale Distributors Pvt Ltd", contact_name: "Ramesh Narayana", phone: "+91 98860 11223", gst_number: "29AAACK1234F1Z8", is_active: true },
        { id: "s2", business_name: "EcoPaws Living & Grooming Supplies", contact_name: "Deepa Sundaram", phone: "+91 99450 44556", gst_number: "29BBCDE5678G2Z4", is_active: true },
      ];
    }

    try {
      const { data, error } = await supabase.from("suppliers").select("*").order("business_name");
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },
};
