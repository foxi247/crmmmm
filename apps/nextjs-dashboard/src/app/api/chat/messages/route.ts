import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import type { ChatRole } from "@prisma/client";

const createMessageSchema = z.object({
  sessionId: z.string().cuid(),
  role: z.enum(["USER", "ASSISTANT", "SYSTEM"]),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 422 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: parsed.data.sessionId,
        role: parsed.data.role as ChatRole,
        content: parsed.data.content,
        metadata: parsed.data.metadata,
      },
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
