import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { OrdersTable } from "@/components/orders/OrdersTable";

interface PageProps {
  searchParams: { page?: string; status?: string };
}

async function getOrders(merchantId: string, page: number, status?: string) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where = {
    merchantId,
    ...(status ? { status: status as never } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;
  const page = Number(searchParams.page ?? 1);
  const { orders, total, totalPages } = await getOrders(merchantId, page, searchParams.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      <OrdersTable orders={orders} page={page} totalPages={totalPages} />
    </div>
  );
}
