import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { formatCurrency } from "@/lib/utils";

async function getDashboardStats(merchantId: string) {
  const [totalOrders, pendingOrders, totalRevenue, totalCustomers] = await Promise.all([
    prisma.order.count({ where: { merchantId } }),
    prisma.order.count({ where: { merchantId, status: "PENDING" } }),
    prisma.order.aggregate({
      where: { merchantId, status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.customer.count({ where: { merchantId } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    where: { merchantId },
    include: { customer: true, orderItems: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    totalCustomers,
    recentOrders,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;
  const stats = await getDashboardStats(merchantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Orders" value={stats.totalOrders.toString()} />
        <StatsCard title="Pending Orders" value={stats.pendingOrders.toString()} />
        <StatsCard title="Revenue" value={formatCurrency(Number(stats.totalRevenue))} />
        <StatsCard title="Customers" value={stats.totalCustomers.toString()} />
      </div>

      <RecentOrders orders={stats.recentOrders} />
    </div>
  );
}
