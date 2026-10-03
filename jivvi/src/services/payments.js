// ==============================================================================
// PAYMENTS SERVICE (Razorpay Standard Integration)
// File: src/services/payments.js
// ==============================================================================

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const paymentsService = {
  /**
   * Dynamically loads the official Razorpay Checkout SDK script
   */
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay Checkout script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Invokes Edge Function to validate prices, check stock, and create Razorpay order
   */
  async createRazorpayOrder({
    shippingName,
    shippingPhone,
    shippingAddress,
    shippingArea,
    shippingCity,
    shippingState,
    shippingPincode,
    couponCode,
    items,
  }) {
    // Demo fallback if Supabase Edge functions are not live
    if (!isSupabaseConfigured) {
      const demoSubtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const demoDelivery = demoSubtotal >= 999 ? 0 : 79;
      const demoTotal = demoSubtotal + demoDelivery;
      const demoOrderNumber = `JIVVI-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`;

      return {
        success: true,
        order_id: "demo-order-" + Date.now(),
        order_number: demoOrderNumber,
        razorpay_order_id: "order_demo_" + Date.now(),
        amount: Math.round(demoTotal * 100),
        currency: "INR",
        subtotal: demoSubtotal,
        discount: 0,
        delivery_fee: demoDelivery,
        total_amount: demoTotal,
        key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_demoKey",
        is_demo: true,
      };
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_name: shippingName,
          shipping_phone: shippingPhone,
          shipping_address: shippingAddress,
          shipping_area: shippingArea,
          shipping_city: shippingCity || "Bengaluru",
          shipping_state: shippingState || "Karnataka",
          shipping_pincode: shippingPincode,
          coupon_code: couponCode,
          items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create checkout order.");
      }

      return result;
    } catch (err) {
      console.error("createRazorpayOrder error:", err);
      throw err;
    }
  },

  /**
   * Invokes Edge Function to verify payment HMAC-SHA256 signature server-side
   */
  async verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, isDemo = false }) {
    if (isDemo || !isSupabaseConfigured) {
      // Simulate verified confirmation for local test/demo mode
      return {
        success: true,
        order_id: orderId,
        order_number: `JIVVI-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        status: "confirmed",
      };
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Payment signature verification failed.");
      }

      return result;
    } catch (err) {
      console.error("verifyPayment error:", err);
      throw err;
    }
  },

  /**
   * Opens Razorpay standard checkout popup
   */
  async openCheckout({
    orderData,
    customer,
    onSuccess,
    onFailure,
    onDismiss,
  }) {
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded) {
      throw new Error("Unable to load Razorpay payment gateway SDK.");
    }

    const options = {
      key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount, // in paise
      currency: "INR",
      name: "JIVVI Pet Care",
      description: `Order #${orderData.order_number}`,
      image: "/images/logo.jpg",
      order_id: orderData.razorpay_order_id,
      prefill: {
        name: customer.name || "",
        email: customer.email || "",
        contact: customer.phone || "",
      },
      theme: {
        color: "#4CAF50", // JIVVI Fresh Green
      },
      handler: async function (response) {
        try {
          const verification = await paymentsService.verifyPayment({
            orderId: orderData.order_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            isDemo: orderData.is_demo,
          });
          onSuccess(verification);
        } catch (err) {
          onFailure(err);
        }
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      onFailure(response.error);
    });
    rzp.open();
  },
};
