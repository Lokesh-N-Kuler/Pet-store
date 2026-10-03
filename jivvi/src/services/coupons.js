// ==============================================================================
// COUPONS SERVICE
// File: src/services/coupons.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const couponsService = {
  /**
   * Evaluates a coupon code server-side
   */
  async evaluateCoupon(code, subtotal, userId = null) {
    if (!code || !subtotal) {
      return { valid: false, message: "Please provide a coupon code." };
    }

    if (!isSupabaseConfigured) {
      // Local fallback for demo codes
      const cleanCode = code.toUpperCase().trim();
      if (cleanCode === "WELCOME10") {
        if (subtotal < 499) {
          return { valid: false, message: "WELCOME10 requires minimum order of ₹499." };
        }
        const discount = Math.min(250, Math.round(subtotal * 0.1));
        return { valid: true, discountAmount: discount, message: "10% Welcome Discount Applied!" };
      }
      if (cleanCode === "BENGALURUFREE") {
        return { valid: true, discountAmount: 79, message: "Free Delivery Credit (₹79) Applied!" };
      }
      if (cleanCode === "JIVVIPUPPY") {
        if (subtotal < 999) {
          return { valid: false, message: "JIVVIPUPPY requires minimum order of ₹999." };
        }
        const discount = Math.min(450, Math.round(subtotal * 0.15));
        return { valid: true, discountAmount: discount, message: "15% Companion Discount Applied!" };
      }
      return { valid: false, message: "Invalid or expired coupon code." };
    }

    try {
      const { data, error } = await supabase.rpc("evaluate_coupon", {
        p_code: code.trim(),
        p_subtotal: Number(subtotal),
        p_user_id: userId,
      });

      if (error) {
        return { valid: false, message: error.message };
      }

      if (data && data.length > 0) {
        return {
          valid: data[0].valid,
          couponId: data[0].coupon_id,
          discountAmount: Number(data[0].discount_amount),
          message: data[0].message,
        };
      }

      return { valid: false, message: "Invalid coupon code." };
    } catch (err) {
      console.warn("Coupon eval error:", err);
      return { valid: false, message: "Failed to validate coupon." };
    }
  },
};
