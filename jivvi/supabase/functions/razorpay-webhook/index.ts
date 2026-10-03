// @ts-nocheck
// ==============================================================================
// Supabase Edge Function: razorpay-webhook
// Runtime: Supabase Edge Runtime / Deno (TypeScript)
// Description: Secure async webhook receiver for Razorpay payment/refund events.
// ==============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

async function verifyWebhookSignature(bodyText: string, signature: string, secret: string): Promise<boolean> {
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

  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
  const hashArray = Array.from(new Uint8Array(signatureBytes));
  const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const cleanSignature = signature.trim().toLowerCase();

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET not configured.");
      return new Response("Webhook secret not set", { status: 500 });
    }

    const signature = req.headers.get("X-Razorpay-Signature");
    if (!signature) {
      return new Response("Missing X-Razorpay-Signature header", { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid Razorpay webhook signature.");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Received Razorpay webhook event: ${event.event}`);

    switch (event.event) {
      case "payment.captured": {
        const paymentEntity = event.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;
        const orderId = paymentEntity.notes?.order_id;

        if (orderId && razorpayOrderId) {
          console.log(`Webhook processing payment.captured for order ${orderId}`);
          await supabase.rpc("complete_order_payment", {
            p_order_id: orderId,
            p_razorpay_order_id: razorpayOrderId,
            p_razorpay_payment_id: razorpayPaymentId,
            p_razorpay_signature: signature,
            p_method: paymentEntity.method || "razorpay_webhook",
          });
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = event.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const orderId = paymentEntity.notes?.order_id;

        if (orderId) {
          console.log(`Webhook processing payment.failed for order ${orderId}`);
          await supabase.rpc("record_failed_payment", {
            p_order_id: orderId,
            p_razorpay_order_id: razorpayOrderId || "",
            p_error_code: paymentEntity.error_code || "FAILED",
            p_error_desc: paymentEntity.error_description || "Payment failed at gateway",
          });
        }
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refundEntity = event.payload.refund.entity;
        const paymentId = refundEntity.payment_id;

        const { data: paymentRecord } = await supabase
          .from("payments")
          .select("id, order_id")
          .eq("razorpay_payment_id", paymentId)
          .single();

        if (paymentRecord) {
          await supabase.from("refunds").insert({
            payment_id: paymentRecord.id,
            razorpay_refund_id: refundEntity.id,
            amount: refundEntity.amount / 100, // paise to INR
            status: refundEntity.status,
            reason: refundEntity.notes?.reason || "Customer refund",
          });

          await supabase
            .from("orders")
            .update({ order_status: "refunded", payment_status: "refunded" })
            .eq("id", paymentRecord.order_id);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.event}`);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
