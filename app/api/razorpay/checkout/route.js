// POST /api/razorpay/checkout -> create a ONE-TIME Razorpay Payment Link for the
// Starter unlock and return its hosted URL. Used while recurring/subscriptions
// aren't enabled on the account. (The recurring flow lives in
// /api/razorpay/subscription — switch the pricing button back to it once
// Razorpay approves recurring payments.)
//
// The Supabase user id rides along in `notes` so the webhook can map the
// completed payment back to the right account.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { razorpay } from "@/lib/razorpay";

const STARTER_PAISE = 24900; // ₹249 — Razorpay amounts are in paise

export async function POST() {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "";

  try {
    const link = await razorpay.paymentLink.create({
      amount: STARTER_PAISE,
      currency: "INR",
      description: "Snip Starter",
      customer: { email: user.email || undefined },
      notify: { email: false, sms: false },
      reminder_enable: false,
      callback_url: `${base}/dashboard?upgraded=1`,
      callback_method: "get",
      notes: { user_id: user.id },
    });
    return NextResponse.json({ url: link.short_url });
  } catch (err) {
    console.error("Razorpay payment link failed:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
