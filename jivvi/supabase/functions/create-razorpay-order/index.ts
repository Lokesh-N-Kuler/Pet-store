// @ts-nocheck
// ==============================================================================
// Supabase Edge Function: create-razorpay-order
// Runtime: Supabase Edge Runtime / Deno (TypeScript)
// Description: Server-side price recalculation, stock reservation, and Razorpay order creation.
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials are not configured on the server.");
    }

    // 1. Authenticate user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access: Invalid or expired session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_area,
      shipping_city,
      shipping_state,
      shipping_pincode,
      coupon_code,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cannot create an order with an empty cart." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Call PostgreSQL RPC create_pending_checkout_order with authenticated user context
    const { data: orderResult, error: orderError } = await supabase.rpc("create_pending_checkout_order", {
      p_shipping_name: shipping_name,
      p_shipping_phone: shipping_phone,
      p_shipping_address: shipping_address,
      p_shipping_area: shipping_area,
      p_shipping_city: shipping_city || "Bengaluru",
      p_shipping_state: shipping_state || "Karnataka",
      p_shipping_pincode: shipping_pincode,
      p_coupon_code: coupon_code || "",
      p_items: items,
      p_user_id: user.id,
    });

    if (orderError) {
      console.error("Order creation failed in DB:", orderError);
      return new Response(
        JSON.stringify({ error: orderError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = typeof orderResult === "string" ? JSON.parse(orderResult) : orderResult;
    const totalAmount = Number(orderData?.total_amount || 0);
    const amountInPaise = Math.round(totalAmount * 100);

    // 3. Create Order on Razorpay
    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderData.order_number,
        notes: {
          order_id: orderData.order_id,
          user_id: user.id,
          order_number: orderData.order_number,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const rzpError = await rzpResponse.json();
      console.error("Razorpay order creation failed:", rzpError);
      return new Response(
        JSON.stringify({ error: "Failed to initialize payment with Razorpay gateway.", details: rzpError }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rzpOrder = await rzpResponse.json();

    // 4. Record initial payment record in DB
    await supabase.from("payments").insert({
      order_id: orderData.order_id,
      razorpay_order_id: rzpOrder.id,
      amount: totalAmount,
      currency: "INR",
      status: "created",
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.order_id,
        order_number: orderData.order_number,
        razorpay_order_id: rzpOrder.id,
        amount: amountInPaise,
        currency: "INR",
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        delivery_fee: orderData.delivery_fee,
        key_id: razorpayKeyId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Unexpected error in create-razorpay-order:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
