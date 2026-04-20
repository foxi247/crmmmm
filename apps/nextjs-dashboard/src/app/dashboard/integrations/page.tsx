import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import type { MessengerType } from "@/types";

export default async function IntegrationsPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;
  const integrations = await prisma.integration.findMany({ where: { merchantId } });

  const types: MessengerType[] = ["TELEGRAM", "WHATSAPP"];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">Connect your messenger bots</p>
      </div>

      {types.map((type) => {
        const integration = integrations.find((i) => i.type === type);
        return (
          <div key={type} className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{type}</h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  integration?.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {integration?.isActive ? "Connected" : "Not connected"}
              </span>
            </div>
            {integration ? (
              <p className="text-sm text-muted-foreground font-mono">
                Token: {integration.token.slice(0, 10)}...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No token configured yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
