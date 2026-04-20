import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Users, DollarSign, Clock } from "lucide-react";

async function getDashboardStats(merchantId: string) {
  const [totalOrders, pendingOrders, totalRevenue, totalCustomers, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { merchantId } }),
      prisma.order.count({ where: { merchantId, status: "PENDING" } }),
      prisma.order.aggregate({
        where: { merchantId, status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        _sum: { totalAmount: true },
      }),
      prisma.customer.count({ where: { merchantId } }),
      prisma.order.findMany({
        where: { merchantId },
        include: { customer: true, orderItems: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

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
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here&rsquo;s what&rsquo;s happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          accent
        />
        <StatsCard
          title="Pending"
          value={stats.pendingOrders.toString()}
          description="Awaiting confirmation"
          icon={Clock}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(Number(stats.totalRevenue))}
          description="Confirmed orders"
          icon={DollarSign}
        />
        <StatsCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
        />
      </div>

      <RecentOrders orders={stats.recentOrders} />
    </div>
  );
}
