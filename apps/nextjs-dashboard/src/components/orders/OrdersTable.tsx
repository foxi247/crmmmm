"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { OrderWithItems } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

interface OrdersTableProps {
  orders: OrderWithItems[];
  page: number;
  totalPages: number;
}

export function OrdersTable({ orders, page, totalPages }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleStatusFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    params.set("page", "1");
    router.push(`/dashboard/orders?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleStatusFilter("")}
          className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${STATUS_CLASSES[s]}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Order ID</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Customer</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Items</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No orders found
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                  #{order.id.slice(-8)}
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium">
                      {order.customerName ?? order.customer.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.phone ?? order.customer.phone}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{order.orderItems.length}</td>
                <td className="px-5 py-3 font-medium">{formatCurrency(Number(order.totalAmount))}</td>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/dashboard/orders?page=${page - 1}`}
                className="px-3 py-1.5 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/dashboard/orders?page=${page + 1}`}
                className="px-3 py-1.5 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
