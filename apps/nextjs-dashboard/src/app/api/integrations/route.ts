import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import type { MessengerType } from "@prisma/client";

const upsertSchema = z.object({
  merchantId: z.string().cuid(),
  type: z.enum(["TELEGRAM", "WHATSAPP", "INSTAGRAM", "VIBER"]),
  token: z.string().min(1),
  webhookSecret: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId");
  if (!merchantId) return NextResponse.json({ error: "merchantId required" }, { status: 400 });

  const integrations = await prisma.integration.findMany({ where: { merchantId } });
  return NextResponse.json({ data: integrations });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 422 });

    const { merchantId, type, token, webhookSecret, isActive, metadata } = parsed.data;

    const integration = await prisma.integration.upsert({
      where: { merchantId_type: { merchantId, type: type as MessengerType } },
      update: { token, webhookSecret, isActive, metadata },
      create: { merchantId, type: type as MessengerType, token, webhookSecret, isActive, metadata },
    });

    return NextResponse.json({ data: integration });
  } catch {
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { merchantId, type } = await req.json();
  if (!merchantId || !type) return NextResponse.json({ error: "merchantId and type required" }, { status: 400 });

  await prisma.integration.deleteMany({ where: { merchantId, type: type as MessengerType } });
  return NextResponse.json({ ok: true });
}
