// ==============================================================================
// CART SERVICE
// File: src/services/cart.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const cartService = {
  /**
   * Fetch authenticated user's cart items from Supabase
   */
  async getCart(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      // Find or create cart
      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: userId })
          .select("id")
          .single();
        cart = newCart;
      }

      if (!cart) return [];

      const { data: items, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product:products (
            id,
            name,
            slug,
            price,
            sale_price,
            stock_quantity,
            weight
          )
        `)
        .eq("cart_id", cart.id);

      if (error || !items) return [];

      return items.map((item) => ({
        cartItemId: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.sale_price || item.product.price),
          stock: item.product.stock_quantity,
          weight: item.product.weight,
        },
      }));
    } catch (err) {
      console.warn("Could not sync remote cart:", err);
      return [];
    }
  },

  /**
   * Sync local items to user's remote cart upon sign in
   */
  async syncCart(userId, localItems) {
    if (!isSupabaseConfigured || !userId || !localItems || localItems.length === 0) return;

    try {
      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: userId })
          .select("id")
          .single();
        cart = newCart;
      }

      if (!cart) return;

      for (const item of localItems) {
        if (item.product?.id) {
          await supabase.from("cart_items").upsert({
            cart_id: cart.id,
            product_id: item.product.id,
            quantity: item.quantity,
          }, { onConflict: "cart_id,product_id" });
        }
      }
    } catch (err) {
      console.warn("Cart sync warning:", err);
    }
  },

  /**
   * Clear user's remote cart
   */
  async clearCart(userId) {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);
      }
    } catch (err) {
      console.warn("Clear cart error:", err);
    }
  },
};
