"use client";

import { useState } from "react";
import { AiProvidersTab } from "./AiProvidersTab";
import { MessengersTab } from "./MessengersTab";
import { cn } from "@/lib/utils";
import type { Integration, BotSettings } from "@/types";

interface Props {
  merchantId: string;
  integrations: Integration[];
  botSettings: BotSettings | null;
}

const TABS = [
  { id: "ai",         label: "AI Providers",  emoji: "🤖" },
  { id: "messengers", label: "Messengers",     emoji: "💬" },
];

export function IntegrationsPanel({ merchantId, integrations, botSettings }: Props) {
  const [tab, setTab] = useState<"ai" | "messengers">("ai");

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ai" && (
        <AiProvidersTab merchantId={merchantId} botSettings={botSettings} />
      )}
      {tab === "messengers" && (
        <MessengersTab merchantId={merchantId} integrations={integrations} />
      )}
    </div>
  );
}
