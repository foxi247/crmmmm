import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";

export default async function BotConfigPage() {
  const session = await auth();
  const merchantId = (session!.user as { merchantId: string }).merchantId;
  const botSettings = await prisma.botSettings.findUnique({ where: { merchantId } });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bot Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize how your AI bot behaves</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">System Prompt</label>
          <textarea
            defaultValue={botSettings?.systemPrompt ?? "You are a helpful sales assistant."}
            rows={5}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tone</label>
            <select
              defaultValue={botSettings?.tone ?? "friendly"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Language</label>
            <select
              defaultValue={botSettings?.language ?? "en"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
              <option value="ru">Russian</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Welcome Message</label>
          <input
            type="text"
            defaultValue={botSettings?.welcomeMessage ?? ""}
            placeholder="Hello! How can I help you today?"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
