import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createOrderSchema } from "@/lib/validations/order";
import type { ApiResponse, OrderWithItems } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const merchantId = searchParams.get("merchantId");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);

  if (!merchantId) {
    return NextResponse.json<ApiResponse<never>>({ error: "merchantId required" }, { status: 400 });
  }

  const where = {
    merchantId,
    ...(status ? { status: status as never } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: true, orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: "Validation failed", message: parsed.error.message },
        { status: 422 }
      );
    }

    const { merchantId, customerId, sessionId, customerName, phone, address, notes, items } =
      parsed.data;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        merchantId,
        customerId,
        sessionId,
        customerName,
        phone,
        address,
        notes,
        totalAmount,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { customer: true, orderItems: { include: { product: true } } },
    });

    return NextResponse.json<ApiResponse<OrderWithItems>>({ data: order }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
