// POST /api/razorpay/subscription -> create a Razorpay subscription for the
// $3 Starter plan and return its hosted checkout URL (short_url). The browser
// then redirects the user there to pay (cards / UPI / etc.).
//
// We stash the Supabase user id in `notes` so the webhook can map the payment
// back to the right account.

import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";
import { razorpay } from "@/lib/razorpay";

export async function POST() {
  const supabase = getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      // Razorpay subscriptions need a finite cycle count. 120 monthly cycles
      // (~10 years) approximates an open-ended plan; raise/lower as you like.
      total_count: 120,
      customer_notify: 1,
      notes: { user_id: user.id, email: user.email || "" },
    });

    // short_url is Razorpay's hosted page where the user completes payment.
    return NextResponse.json({ url: subscription.short_url });
  } catch (err) {
    console.error("Razorpay subscription create failed:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
