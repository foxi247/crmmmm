import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  merchantId: z.string().cuid(),
  systemPrompt: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
  welcomeMessage: z.string().nullable().optional(),
  fallbackMessage: z.string().nullable().optional(),
  enableRag: z.boolean().optional(),
  enableOrders: z.boolean().optional(),
  humanTrigger: z.string().optional(),
  aiProvider: z.string().optional(),
  aiModel: z.string().optional(),
  aiApiKey: z.string().nullable().optional(),
  businessHours: z.record(z.any()).nullable().optional(),
  autoReplies: z.array(z.any()).nullable().optional(),
  outsideHoursMsg: z.string().nullable().optional(),
  enableEmoji: z.boolean().optional(),
  orderConfirmTpl: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) return NextResponse.json({ error: "merchantId required" }, { status: 400 });

  const settings = await prisma.botSettings.findUnique({ where: { merchantId } });
  return NextResponse.json({ data: settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 422 });

    const { merchantId, ...data } = parsed.data;

    const settings = await prisma.botSettings.upsert({
      where: { merchantId },
      update: data,
      create: { merchantId, ...data },
    });

    return NextResponse.json({ data: settings });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
