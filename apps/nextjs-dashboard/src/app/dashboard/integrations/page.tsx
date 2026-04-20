import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { IntegrationsPanel } from "@/components/integrations/IntegrationsPanel";

export default async function IntegrationsPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;

  const [integrations, botSettings] = await Promise.all([
    prisma.integration.findMany({ where: { merchantId } }),
    prisma.botSettings.findUnique({ where: { merchantId } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Connect AI providers and messaging platforms
        </p>
      </div>
      <IntegrationsPanel
        merchantId={merchantId}
        integrations={integrations}
        botSettings={botSettings}
      />
    </div>
  );
}
