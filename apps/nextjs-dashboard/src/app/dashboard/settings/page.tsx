import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";

export default async function SettingsPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Merchant Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{merchant?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{merchant?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono">{merchant?.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Merchant ID</span>
            <span className="font-mono text-xs">{merchantId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
