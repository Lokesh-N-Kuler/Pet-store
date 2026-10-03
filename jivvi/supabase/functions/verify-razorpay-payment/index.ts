// @ts-nocheck
// ==============================================================================
// Supabase Edge Function: verify-razorpay-payment
// Runtime: Supabase Edge Runtime / Deno (TypeScript)
// Description: HMAC-SHA256 signature verification & atomic order fulfillment.
// ==============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Utility to verify Razorpay HMAC-SHA256 signature using Web Crypto API
async function verifyHmacSha256(data: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || typeof signature !== "string" || !secret) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(signatureBytes));
  const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const cleanSignature = signature.trim().toLowerCase();

  // Constant-time string equality check to prevent timing attacks
  if (expectedSignature.length !== cleanSignature.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ cleanSignature.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret is not configured on the server.");
    }

    const body = await req.json();
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify HMAC signature
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isValid = await verifyHmacSha256(signaturePayload, razorpay_signature, razorpayKeySecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!isValid) {
      console.error(`Invalid payment signature received for order ${order_id}`);
      await supabase.rpc("record_failed_payment", {
        p_order_id: order_id,
        p_razorpay_order_id: razorpay_order_id,
        p_error_code: "SIGNATURE_VERIFICATION_FAILED",
        p_error_desc: "Razorpay payment signature does not match computed HMAC-SHA256 digest.",
      });

      return new Response(
        JSON.stringify({ error: "Payment signature verification failed. Order not confirmed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Complete order payment atomically in PostgreSQL
    const { data: fulfillmentResult, error: fulfillmentError } = await supabase.rpc(
      "complete_order_payment",
      {
        p_order_id: order_id,
        p_razorpay_order_id: razorpay_order_id,
        p_razorpay_payment_id: razorpay_payment_id,
        p_razorpay_signature: razorpay_signature,
        p_method: "razorpay",
      }
    );

    if (fulfillmentError) {
      console.error("Order fulfillment RPC failed:", fulfillmentError);
      return new Response(
        JSON.stringify({ error: fulfillmentError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultObj = typeof fulfillmentResult === "string" 
      ? JSON.parse(fulfillmentResult) 
      : fulfillmentResult;

    return new Response(
      JSON.stringify(resultObj || { success: true, order_id, status: "confirmed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Unexpected error in verify-razorpay-payment:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
