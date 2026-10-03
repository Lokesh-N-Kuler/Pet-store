// ==============================================================================
// REVIEWS SERVICE
// File: src/services/reviews.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const reviewsService = {
  /**
   * Get approved reviews for a product
   */
  async getProductReviews(productId) {
    if (!isSupabaseConfigured || !productId) {
      return [
        { id: "r1", rating: 5, review_text: "My golden retriever loves this kibble! His coat has been noticeably shinier.", user_name: "Priya S." },
        { id: "r2", rating: 5, review_text: "Delivered in Indiranagar within 3 hours. Super impressed with JIVVI packaging!", user_name: "Rahul M." }
      ];
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          user:profiles (
            full_name
          )
        `)
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((r) => ({
        id: r.id,
        rating: r.rating,
        review_text: r.review_text,
        user_name: r.user?.full_name || "Verified Customer",
        created_at: r.created_at,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Submit a verified customer review
   */
  async submitReview({ productId, orderId, rating, reviewText, userId }) {
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        order_id: orderId,
        user_id: userId,
        rating,
        review_text: reviewText,
        is_approved: true, // Default approved for verified buyers
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Submit review error:", err);
      throw err;
    }
  },
};
