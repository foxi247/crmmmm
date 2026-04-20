import Link from "next/link";
import type { Order, Customer, OrderItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-amber-50  text-amber-700  border-amber-200",
  CONFIRMED:  "bg-blue-50   text-blue-700   border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED:  "bg-green-50  text-green-700  border-green-200",
  CANCELLED:  "bg-red-50    text-red-700    border-red-200",
};

interface RecentOrdersProps {
  orders: (Order & { customer: Customer; orderItems: OrderItem[] })[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-sm">Recent Orders</h2>
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-14 text-muted-foreground text-sm">
                  No orders yet. They'll appear here once customers start placing orders.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-5 py-3 font-medium text-foreground">
                  {order.customer.name ?? order.customer.username ?? order.customer.externalId}
                </td>
                <td className="px-5 py-3 font-semibold text-foreground">
                  {formatCurrency(Number(order.totalAmount))}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
