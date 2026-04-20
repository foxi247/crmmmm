import Link from "next/link";
import type { Order, Customer, OrderItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface RecentOrdersProps {
  orders: (Order & { customer: Customer; orderItems: OrderItem[] })[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Recent Orders</h2>
        <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Order ID</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Customer</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No orders yet
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                  #{order.id.slice(-8)}
                </td>
                <td className="px-5 py-3">
                  {order.customer.name ?? order.customer.username ?? order.customer.externalId}
                </td>
                <td className="px-5 py-3">{formatCurrency(Number(order.totalAmount))}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_CLASSES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
