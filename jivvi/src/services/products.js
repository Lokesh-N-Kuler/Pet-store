// ==============================================================================
// PRODUCTS SERVICE
// File: src/services/products.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { products as fallbackProducts } from "../data/products";

export const productsService = {
  /**
   * Fetch active catalog products with optional filters
   */
  async getProducts({ category = "all", petType = "all", search = "", limit = 50 } = {}) {
    if (!isSupabaseConfigured) {
      return this._filterFallbackProducts({ category, petType, search, limit });
    }

    try {
      let query = supabase
        .from("public_products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (category && category !== "all") {
        query = query.eq("category_slug", category);
      }

      if (petType && petType !== "all") {
        query = query.or(`pet_type.eq.${petType},pet_type.eq.both`);
      }

      if (search && search.trim() !== "") {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return this._filterFallbackProducts({ category, petType, search, limit });
      }

      return data.map(this._mapDatabaseProduct);
    } catch (err) {
      console.warn("Falling back to local product data:", err);
      return this._filterFallbackProducts({ category, petType, search, limit });
    }
  },

  /**
   * Fetch single product by its unique slug or id
   */
  async getProductById(id) {
    if (!isSupabaseConfigured) {
      return fallbackProducts.find((p) => p.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from("public_products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return fallbackProducts.find((p) => p.id === id) || null;
      }
      return this._mapDatabaseProduct(data);
    } catch {
      return fallbackProducts.find((p) => p.id === id) || null;
    }
  },

  /**
   * Map database row to standard UI component format
   */
  _mapDatabaseProduct(row) {
    const discountPercent = row.sale_price && row.price > row.sale_price
      ? `${Math.round(((row.price - row.sale_price) / row.price) * 100)}% OFF`
      : null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      petType: row.pet_type || "both",
      category: row.category_slug || "food-treats",
      categoryName: row.category_name || "Pet Essentials",
      brand: row.brand_name || "JIVVI",
      shortDesc: row.description,
      description: row.description,
      price: Number(row.sale_price || row.price),
      originalPrice: row.sale_price ? Number(row.price) : null,
      discount: discountPercent,
      stock: row.stock_quantity,
      inStock: row.stock_quantity > 0,
      weight: row.weight,
      rating: 4.9,
      reviewsCount: 120,
      badge: row.is_featured ? "Best Seller" : null,
      iconType: row.category_slug?.includes("food") ? "food" : "bone",
    };
  },

  /**
   * In-memory filter for local demo catalog
   */
  _filterFallbackProducts({ category, petType, search, limit }) {
    let result = [...fallbackProducts];

    if (category && category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (petType && petType !== "all") {
      result = result.filter((p) => p.petType === petType || p.petType === "both");
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDesc?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result.slice(0, limit);
  }
};
