// @ts-nocheck
// ==============================================================================
// Supabase Edge Function: apply-coupon
// Runtime: Supabase Edge Runtime / Deno (TypeScript)
// Description: Server-side promotional coupon validation & discount calculation.
// ==============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Optional user context
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string" || !subtotal || subtotal <= 0) {
      return new Response(
        JSON.stringify({ valid: false, message: "Please enter a valid coupon code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call PostgreSQL RPC evaluate_coupon
    const { data, error } = await supabase.rpc("evaluate_coupon", {
      p_code: code.trim(),
      p_subtotal: Number(subtotal),
      p_user_id: userId,
    });

    if (error) {
      return new Response(
        JSON.stringify({ valid: false, message: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = data && data.length > 0 ? data[0] : { valid: false, message: "Invalid coupon" };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ valid: false, message: err.message || "Failed to validate coupon" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
