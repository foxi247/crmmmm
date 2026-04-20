"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Loader2, CheckCircle, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSENGER_CONFIGS } from "@/lib/ai-providers";
import type { Integration } from "@/types";

interface Props {
  merchantId: string;
  integrations: Integration[];
}

export function MessengersTab({ merchantId, integrations: initialIntegrations }: Props) {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<Record<string, Record<string, string>>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  function getIntegration(type: string) {
    return integrations.find((i) => i.type === type);
  }

  async function handleSave(type: string) {
    const token = tokens[type] ?? getIntegration(type)?.token ?? "";
    if (!token) return;

    setSaving((s) => ({ ...s, [type]: true }));

    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        type,
        token,
        isActive: true,
        metadata: extras[type] ?? {},
      }),
    });

    const data = await res.json();
    setIntegrations((prev) => {
      const exists = prev.find((i) => i.type === type);
      if (exists) return prev.map((i) => (i.type === type ? data.data : i));
      return [...prev, data.data];
    });

    setSaving((s) => ({ ...s, [type]: false }));
    setSaved((s) => ({ ...s, [type]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [type]: false })), 3000);
  }

  async function handleDelete(type: string) {
    await fetch("/api/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId, type }),
    });
    setIntegrations((prev) => prev.filter((i) => i.type !== type));
    setTokens((t) => { const n = { ...t }; delete n[type]; return n; });
  }

  function copyWebhook(type: string) {
    const url = `${window.location.origin}/api/webhooks/${type.toLowerCase()}?merchantId=${merchantId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MESSENGER_CONFIGS.map((cfg) => {
        const integration = getIntegration(cfg.type);
        const isConnected = !!integration?.isActive;
        const isOpen = expanded === cfg.type;

        return (
          <div
            key={cfg.type}
            className={cn(
              "bg-card border rounded-xl overflow-hidden transition-all",
              isConnected ? "border-green-200" : "border-border"
            )}
          >
            {/* Card header */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: cfg.bg }}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{cfg.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: isConnected ? "#22c55e" : "#d1d5db" }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {isConnected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <button
                      onClick={() => handleDelete(cfg.type)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setExpanded(isOpen ? null : cfg.type)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
                    style={isConnected ? { borderColor: cfg.color, color: cfg.color } : {}}
                  >
                    {isOpen ? "Close" : isConnected ? "Edit" : "Connect"}
                  </button>
                </div>
              </div>

              {/* Webhook URL (when connected) */}
              {isConnected && !isOpen && (
                <div className="mt-3 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground font-mono truncate flex-1">
                    /api/webhooks/{cfg.type.toLowerCase()}
                  </span>
                  <button
                    onClick={() => copyWebhook(cfg.type)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Expanded form */}
            {isOpen && (
              <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                {/* Token */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{cfg.tokenLabel}</label>
                  <div className="relative">
                    <input
                      type={showKeys[cfg.type] ? "text" : "password"}
                      placeholder={cfg.tokenPlaceholder}
                      defaultValue={integration?.token}
                      onChange={(e) =>
                        setTokens((t) => ({ ...t, [cfg.type]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys((k) => ({ ...k, [cfg.type]: !k[cfg.type] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showKeys[cfg.type] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <a
                    href={cfg.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {cfg.helpText} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Extra fields */}
                {cfg.extraFields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      defaultValue={(integration?.metadata as Record<string,string>)?.[field.key]}
                      onChange={(e) =>
                        setExtras((ex) => ({
                          ...ex,
                          [cfg.type]: { ...(ex[cfg.type] ?? {}), [field.key]: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}

                {/* Webhook URL */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Webhook URL</label>
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2.5">
                    <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                      {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}
                      /api/webhooks/{cfg.type.toLowerCase()}?merchantId={merchantId}
                    </span>
                    <button onClick={() => copyWebhook(cfg.type)} className="text-muted-foreground hover:text-foreground">
                      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Paste this URL in your {cfg.name} webhook settings.</p>
                </div>

                <button
                  onClick={() => handleSave(cfg.type)}
                  disabled={saving[cfg.type]}
                  className="flex items-center gap-2 bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving[cfg.type] && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saved[cfg.type] ? (
                    <><CheckCircle className="h-3.5 w-3.5" /> Saved!</>
                  ) : (
                    "Save & Connect"
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
