import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import type { ApiResponse, OrderWithItems } from "@/types";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, orderItems: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json<ApiResponse<never>>({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json<ApiResponse<OrderWithItems>>({ data: order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>({ error: "Invalid status" }, { status: 422 });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: { customer: true, orderItems: { include: { product: true } } },
    });

    return NextResponse.json<ApiResponse<OrderWithItems>>({ data: order });
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
