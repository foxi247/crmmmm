import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { formatDate } from "@/lib/utils";

export default async function CustomersPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;

  const customers = await prisma.customer.findMany({
    where: { merchantId },
    include: { _count: { select: { orders: true, chatSessions: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">{customers.length} customers</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Name</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Messenger</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Phone</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Orders</th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No customers yet
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                <td className="px-5 py-3 font-medium">
                  {c.name ?? c.username ?? c.externalId}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {c.messengerType}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                <td className="px-5 py-3">{c._count.orders}</td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
