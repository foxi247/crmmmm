import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { BotConfigPanel } from "@/components/bot-config/BotConfigPanel";

export default async function BotConfigPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;
  const botSettings = await prisma.botSettings.findUnique({ where: { merchantId } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bot Configuration</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Customize how your AI assistant behaves
        </p>
      </div>
      <BotConfigPanel merchantId={merchantId} botSettings={botSettings} />
    </div>
  );
}
