import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(req: NextRequest) {
  // Always return 200 to Telegram immediately — never let them retry endlessly
  const body = await req.json();
  const merchantId = req.nextUrl.searchParams.get("merchantId");

  if (!merchantId) return NextResponse.json({ ok: true });

  const message = body?.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId: number = message.chat?.id;
  const text: string = message.text;

  // Get the integration token so we can reply directly
  const integration = await prisma.integration.findUnique({
    where: { merchantId_type: { merchantId, type: "TELEGRAM" } },
  }).catch(() => null);

  const token = integration?.token;

  try {
    // Try AI microservice first
    const aiRes = await fetch(`${AI_SERVICE_URL}/webhook/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, merchant_id: merchantId }),
      signal: AbortSignal.timeout(8000),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      // If AI service returned a reply, send it
      if (aiData.reply && token && chatId) {
        await sendTelegramMessage(token, chatId, aiData.reply);
      }
      return NextResponse.json({ ok: true });
    }
  } catch {
    // AI service unavailable — fall back to basic echo reply
  }

  // Fallback: echo reply so the bot at least responds
  if (token && chatId) {
    const botSettings = await prisma.botSettings.findUnique({
      where: { merchantId },
    }).catch(() => null);

    const fallback =
      botSettings?.fallbackMessage ??
      "Hello! Our AI assistant is warming up. Please try again in a moment.";

    await sendTelegramMessage(token, chatId, fallback);
  }

  return NextResponse.json({ ok: true });
}
