import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const createProductSchema = z.object({
  merchantId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  unit: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const merchantId = searchParams.get("merchantId");

  if (!merchantId) {
    return NextResponse.json({ error: "merchantId required" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { merchantId, isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 422 });
    }

    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
