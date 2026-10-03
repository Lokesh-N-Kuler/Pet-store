// ==============================================================================
// WISHLIST SERVICE
// File: src/services/wishlist.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const wishlistService = {
  async getWishlist(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      let { data: wishlist } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!wishlist) {
        const { data: newWishlist } = await supabase
          .from("wishlist")
          .insert({ user_id: userId })
          .select("id")
          .single();
        wishlist = newWishlist;
      }

      if (!wishlist) return [];

      const { data: items } = await supabase
        .from("wishlist_items")
        .select(`
          id,
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
        .eq("wishlist_id", wishlist.id);

      return (items || []).map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: Number(i.product.sale_price || i.product.price),
        stock: i.product.stock_quantity,
      }));
    } catch {
      return [];
    }
  },

  async toggleWishlistItem(userId, productId) {
    if (!isSupabaseConfigured || !userId) return;

    try {
      let { data: wishlist } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!wishlist) {
        const { data: newW } = await supabase.from("wishlist").insert({ user_id: userId }).select("id").single();
        wishlist = newW;
      }

      if (!wishlist) return;

      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("wishlist_id", wishlist.id)
        .eq("product_id", productId)
        .single();

      if (existing) {
        await supabase.from("wishlist_items").delete().eq("id", existing.id);
      } else {
        await supabase.from("wishlist_items").insert({
          wishlist_id: wishlist.id,
          product_id: productId,
        });
      }
    } catch (err) {
      console.warn("Wishlist toggle error:", err);
    }
  },
};
