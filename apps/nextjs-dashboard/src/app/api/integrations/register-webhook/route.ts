import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { merchantId, type, token } = await req.json();

    if (type === "TELEGRAM") {
      const webhookUrl = `${req.nextUrl.origin}/api/webhooks/telegram?merchantId=${merchantId}`;

      const res = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"],
            drop_pending_updates: true,
          }),
        }
      );

      const data = await res.json();

      if (!data.ok) {
        return NextResponse.json(
          { error: data.description ?? "Telegram rejected the webhook" },
          { status: 400 }
        );
      }

      return NextResponse.json({ ok: true, description: data.description });
    }

    // WhatsApp / Instagram webhooks are registered manually by the platform
    return NextResponse.json({ ok: true, message: "Manual registration required" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
