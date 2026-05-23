// POST /api/razorpay/webhook -> Razorpay calls this when subscription events
// happen. We verify the signature against the RAW body (HMAC-SHA256 with your
// webhook secret), then flip the user's plan.
//
//   subscription.activated / .charged / .resumed  -> 'starter'
//   subscription.cancelled / .completed / .halted / .paused -> 'free'
//
// The user id travels in the subscription's `notes` (set when we created it).

import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminClient } from "@/lib/supabase-server";

const ACTIVATE = ["subscription.activated", "subscription.charged", "subscription.resumed"];
const DEACTIVATE = ["subscription.cancelled", "subscription.completed", "subscription.halted", "subscription.paused"];

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(body)
    .digest("hex");

  // Constant-time compare to verify the request really came from Razorpay.
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const sub = event?.payload?.subscription?.entity;
  const userId = sub?.notes?.user_id;
  const admin = getAdminClient();

  if (userId && ACTIVATE.includes(event.event)) {
    await admin
      .from("profiles")
      .update({ plan: "starter", billing_ref: sub.id })
      .eq("id", userId);
  }

  if (userId && DEACTIVATE.includes(event.event)) {
    await admin.from("profiles").update({ plan: "free" }).eq("id", userId);
  }

  return NextResponse.json({ received: true });
}
