// ==============================================================================
// CATEGORIES & BRANDS SERVICE
// File: src/services/categories.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { categories as fallbackCategories } from "../data/categories";

export const categoriesService = {
  async getCategories() {
    if (!isSupabaseConfigured) {
      return fallbackCategories;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error || !data || data.length === 0) {
        return fallbackCategories;
      }

      return data.map((c) => ({
        id: c.slug,
        dbId: c.id,
        name: c.name,
        petType: c.pet_type,
        count: 12,
        image: c.image_url || "/images/care.jpg",
        description: c.description,
      }));
    } catch {
      return fallbackCategories;
    }
  },
};

export const brandsService = {
  async getBrands() {
    if (!isSupabaseConfigured) {
      return [
        { id: "jivvi-curated", name: "JIVVI Curated" },
        { id: "wildcoast-pet", name: "WildCoast Pet" },
        { id: "toughpaws", name: "ToughPaws" },
        { id: "purecoat", name: "PureCoat Botanicals" },
      ];
    }

    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },
};
