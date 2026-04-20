import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import type { MessengerType } from "@prisma/client";

const upsertCustomerSchema = z.object({
  merchantId: z.string().cuid(),
  externalId: z.string().min(1),
  messengerType: z.enum(["TELEGRAM", "WHATSAPP"]),
  name: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = upsertCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 422 });
    }

    const { merchantId, externalId, messengerType, name, username } = parsed.data;

    const customer = await prisma.customer.upsert({
      where: { merchantId_externalId_messengerType: { merchantId, externalId, messengerType: messengerType as MessengerType } },
      create: { merchantId, externalId, messengerType: messengerType as MessengerType, name, username },
      update: { name: name ?? undefined, username: username ?? undefined },
    });

    // Find or create active session
    let session = await prisma.chatSession.findFirst({
      where: { merchantId, customerId: customer.id, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { merchantId, customerId: customer.id },
      });
    }

    return NextResponse.json({ data: { ...customer, activeSessionId: session.id } }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to upsert customer" }, { status: 500 });
  }
}
