// ==============================================================================
// PROFILE & ADDRESSES SERVICE
// File: src/services/profile.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const profileService = {
  /**
   * Get user profile details
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured || !userId) {
      return {
        id: userId || "guest-user",
        full_name: "Valued Pet Parent",
        email: "parent@jivvi.com",
        phone: "+91 98860 12345",
        role: "customer",
      };
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return {
          id: userId,
          full_name: "Valued Pet Parent",
          role: "customer",
        };
      }
      return data;
    } catch {
      return { id: userId, role: "customer" };
    }
  },

  /**
   * Update profile information
   */
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !userId) return { success: true };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
        })
        .eq("id", userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  },

  /**
   * Get customer's saved shipping addresses
   */
  async getAddresses(userId) {
    if (!isSupabaseConfigured || !userId) {
      const stored = localStorage.getItem("jivvi_demo_addresses");
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: "addr-demo-1",
              full_name: "Lokesh N K",
              phone: "+91 98861 93296",
              address_line_1: "Flat 402, Green Glen Layout, Bellandur",
              area: "Outer Ring Road",
              city: "Bengaluru",
              state: "Karnataka",
              pincode: "560103",
              is_default: true,
            },
          ];
    }

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      if (error || !data || data.length === 0) {
        const stored = localStorage.getItem("jivvi_demo_addresses");
        return stored ? JSON.parse(stored) : [];
      }

      return data;
    } catch {
      return [];
    }
  },

  /**
   * Save a new address
   */
  async addAddress(userId, address) {
    if (!isSupabaseConfigured || !userId) {
      const existing = await this.getAddresses(userId);
      const newAddr = { ...address, id: "addr-" + Date.now(), is_default: existing.length === 0 };
      const updated = [...existing, newAddr];
      localStorage.setItem("jivvi_demo_addresses", JSON.stringify(updated));
      return newAddr;
    }

    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          full_name: address.full_name,
          phone: address.phone,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2 || "",
          area: address.area,
          city: address.city || "Bengaluru",
          state: address.state || "Karnataka",
          pincode: address.pincode,
          landmark: address.landmark || "",
          is_default: address.is_default || false,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Add address error:", err);
      throw err;
    }
  },
};
