"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { OrderWithItems } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-amber-50  text-amber-700  border-amber-200",
  CONFIRMED:  "bg-blue-50   text-blue-700   border-blue-200",
  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED:  "bg-green-50  text-green-700  border-green-200",
  CANCELLED:  "bg-red-50    text-red-700    border-red-200",
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
  const currentStatus = searchParams.get("status") ?? "";

  function handleStatusFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    params.set("page", "1");
    router.push(`/dashboard/orders?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleStatusFilter("")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
            !currentStatus
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusFilter(s)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
              currentStatus === s
                ? `${STATUS_STYLES[s]} font-semibold`
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {["Order ID", "Customer", "Items", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-14 text-muted-foreground text-sm">
                  No orders found
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {order.customerName ?? order.customer.name ?? "—"}
                    </p>
                    {(order.phone ?? order.customer.phone) && (
                      <p className="text-xs text-muted-foreground">{order.phone ?? order.customer.phone}</p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{order.orderItems.length}</td>
                <td className="px-5 py-3 font-semibold text-foreground">
                  {formatCurrency(Number(order.totalAmount))}
                </td>
                <td className="px-5 py-3">
                  <span className={cn("inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border", STATUS_STYLES[order.status])}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-muted-foreground text-xs">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/dashboard/orders?page=${page - 1}`}
                className="px-4 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/dashboard/orders?page=${page + 1}`}
                className="px-4 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
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
