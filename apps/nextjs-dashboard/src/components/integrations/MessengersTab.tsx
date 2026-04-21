"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Loader2, CheckCircle, Trash2, Copy, Check, AlertCircle } from "lucide-react";
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

  // Controlled token inputs keyed by messenger type
  const [tokens, setTokens] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialIntegrations.map((i) => [i.type, i.token]))
  );
  const [extras, setExtras] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(
      initialIntegrations.map((i) => [i.type, (i.metadata as Record<string, string>) ?? {}])
    )
  );

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [webhookStatus, setWebhookStatus] = useState<Record<string, "ok" | "error" | null>>({});
  const [copied, setCopied] = useState<string | null>(null);

  function getIntegration(type: string) {
    return integrations.find((i) => i.type === type);
  }

  function webhookUrl(type: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/api/webhooks/${type.toLowerCase()}?merchantId=${merchantId}`;
  }

  function copyWebhook(type: string) {
    navigator.clipboard.writeText(webhookUrl(type));
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSave(type: string) {
    const token = tokens[type] ?? "";
    if (!token.trim()) {
      setErrors((e) => ({ ...e, [type]: "Token cannot be empty." }));
      return;
    }

    setSaving((s) => ({ ...s, [type]: true }));
    setErrors((e) => ({ ...e, [type]: "" }));
    setWebhookStatus((w) => ({ ...w, [type]: null }));

    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          type,
          token: token.trim(),
          isActive: true,
          metadata: extras[type] ?? {},
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((e) => ({ ...e, [type]: data.error ?? "Failed to save. Try again." }));
        setSaving((s) => ({ ...s, [type]: false }));
        return;
      }

      // Update local integrations state
      setIntegrations((prev) => {
        const exists = prev.find((i) => i.type === type);
        return exists
          ? prev.map((i) => (i.type === type ? data.data : i))
          : [...prev, data.data];
      });

      // Auto-register Telegram webhook
      if (type === "TELEGRAM") {
        const whRes = await fetch("/api/integrations/register-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantId, type, token: token.trim() }),
        });
        setWebhookStatus((w) => ({ ...w, [type]: whRes.ok ? "ok" : "error" }));
      }
    } catch {
      setErrors((e) => ({ ...e, [type]: "Network error. Check your connection." }));
    } finally {
      setSaving((s) => ({ ...s, [type]: false }));
    }
  }

  async function handleDelete(type: string) {
    await fetch("/api/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId, type }),
    });
    setIntegrations((prev) => prev.filter((i) => i.type !== type));
    setTokens((t) => { const n = { ...t }; delete n[type]; return n; });
    setWebhookStatus((w) => ({ ...w, [type]: null }));
    setExpanded(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MESSENGER_CONFIGS.map((cfg) => {
        const integration = getIntegration(cfg.type);
        const isConnected = !!integration?.isActive;
        const isOpen = expanded === cfg.type;
        const error = errors[cfg.type];
        const wh = webhookStatus[cfg.type];

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

              {/* Webhook URL pill (when connected, not editing) */}
              {isConnected && !isOpen && (
                <div className="mt-3 flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground font-mono truncate flex-1">
                    /api/webhooks/{cfg.type.toLowerCase()}
                  </span>
                  <button
                    onClick={() => copyWebhook(cfg.type)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === cfg.type
                      ? <Check className="h-3.5 w-3.5 text-green-600" />
                      : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Expanded form */}
            {isOpen && (
              <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                {/* Token — CONTROLLED input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{cfg.tokenLabel}</label>
                  <div className="relative">
                    <input
                      type={showKeys[cfg.type] ? "text" : "password"}
                      value={tokens[cfg.type] ?? ""}
                      onChange={(e) =>
                        setTokens((t) => ({ ...t, [cfg.type]: e.target.value }))
                      }
                      placeholder={cfg.tokenPlaceholder}
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
                      value={extras[cfg.type]?.[field.key] ?? ""}
                      onChange={(e) =>
                        setExtras((ex) => ({
                          ...ex,
                          [cfg.type]: { ...(ex[cfg.type] ?? {}), [field.key]: e.target.value },
                        }))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}

                {/* Webhook URL */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Webhook URL</label>
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2.5">
                    <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                      {webhookUrl(cfg.type)}
                    </span>
                    <button onClick={() => copyWebhook(cfg.type)} className="text-muted-foreground hover:text-foreground">
                      {copied === cfg.type ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {cfg.type === "TELEGRAM" && (
                    <p className="text-xs text-muted-foreground">
                      Webhook is registered automatically when you save.
                    </p>
                  )}
                  {cfg.type !== "TELEGRAM" && (
                    <p className="text-xs text-muted-foreground">
                      Paste this URL in your {cfg.name} webhook settings.
                    </p>
                  )}
                </div>

                {/* Error / success messages */}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}
                {wh === "ok" && (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Webhook registered with Telegram — your bot is live!
                  </div>
                )}
                {wh === "error" && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Token saved, but webhook registration failed. Make sure the URL is publicly accessible and the token is correct.
                  </div>
                )}

                <button
                  onClick={() => handleSave(cfg.type)}
                  disabled={saving[cfg.type]}
                  className="flex items-center gap-2 bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving[cfg.type] && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save & Connect
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
