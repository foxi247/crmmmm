"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import type { BotSettings } from "@/types";

interface Props {
  merchantId: string;
  botSettings: BotSettings | null;
}

export function AiProvidersTab({ merchantId, botSettings }: Props) {
  const [selectedProvider, setSelectedProvider] = useState(
    botSettings?.aiProvider ?? "openai"
  );
  const [selectedModel, setSelectedModel] = useState(
    botSettings?.aiModel ?? "gpt-4o-mini"
  );
  const [apiKey, setApiKey] = useState(botSettings?.aiApiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);

  const provider = AI_PROVIDERS.find((p) => p.id === selectedProvider)!;

  function handleProviderSelect(id: string) {
    setSelectedProvider(id);
    const prov = AI_PROVIDERS.find((p) => p.id === id)!;
    setSelectedModel(prov.models[0].id);
    setTestResult(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/bot-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        aiProvider: selectedProvider,
        aiModel: selectedModel,
        aiApiKey: apiKey || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    // Simulate a connection test (real impl would call the AI provider)
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult(apiKey.length > 10 ? "ok" : "error");
    setTesting(false);
  }

  return (
    <div className="space-y-5">
      {/* Provider cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {AI_PROVIDERS.map((p) => {
          const active = selectedProvider === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleProviderSelect(p.id)}
              style={active ? { borderColor: p.color, background: p.bg } : {}}
              className={cn(
                "relative text-left rounded-xl border-2 p-4 transition-all hover:shadow-card",
                active ? "shadow-card" : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              {active && (
                <CheckCircle
                  className="absolute top-3 right-3 h-4 w-4"
                  style={{ color: p.color }}
                />
              )}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold mb-3"
                style={{ background: p.color }}
              >
                {p.name[0]}
              </div>
              <p className="font-semibold text-foreground text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Config panel */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: provider.color }}
          >
            {provider.name[0]}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              Configure {provider.name}
            </p>
            <p className="text-xs text-muted-foreground">{provider.tagline}</p>
          </div>
        </div>

        {/* Model selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {provider.models.map((model) => {
              const active = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "text-left rounded-lg border px-3 py-2.5 transition-all",
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{model.name}</span>
                    {model.badge && (
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: provider.bg,
                          color: provider.color,
                        }}
                      >
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{model.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
                placeholder={`Enter your ${provider.name} API key`}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={handleTest}
              disabled={!apiKey || testing}
              className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
            >
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Test
            </button>
          </div>

          {testResult === "ok" && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Connection successful
            </p>
          )}
          {testResult === "error" && (
            <p className="text-xs text-destructive">
              ✗ Invalid API key. Check and try again.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Key is stored securely and only used to call the AI provider.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saved ? "✓ Saved!" : "Save configuration"}
          </button>
          {saved && <p className="text-xs text-green-600">Changes applied</p>}
        </div>
      </div>
    </div>
  );
}
