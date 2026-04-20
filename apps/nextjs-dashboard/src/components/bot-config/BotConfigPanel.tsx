"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Clock, Zap, MessageSquare, Settings2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BotSettings } from "@/types";

interface AutoReply {
  keyword: string;
  reply: string;
  exact: boolean;
}

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

type BusinessHours = Record<string, DaySchedule>;

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const DEFAULT_HOURS: BusinessHours = Object.fromEntries(
  DAYS.map((d) => [d, { active: ["monday","tuesday","wednesday","thursday","friday"].includes(d), start: "09:00", end: "18:00" }])
);

const TABS = [
  { id: "personality", label: "Personality", icon: MessageSquare },
  { id: "hours",       label: "Business Hours", icon: Clock },
  { id: "autoreplies", label: "Auto-Replies", icon: Zap },
  { id: "features",    label: "Features", icon: Settings2 },
];

interface Props {
  merchantId: string;
  botSettings: BotSettings | null;
}

export function BotConfigPanel({ merchantId, botSettings }: Props) {
  const [tab, setTab] = useState("personality");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Personality
  const [systemPrompt, setSystemPrompt] = useState(
    botSettings?.systemPrompt ?? "You are a helpful sales assistant."
  );
  const [tone, setTone] = useState(botSettings?.tone ?? "friendly");
  const [language, setLanguage] = useState(botSettings?.language ?? "en");
  const [welcomeMessage, setWelcomeMessage] = useState(botSettings?.welcomeMessage ?? "");
  const [fallbackMessage, setFallbackMessage] = useState(botSettings?.fallbackMessage ?? "");
  const [humanTrigger, setHumanTrigger] = useState(botSettings?.humanTrigger ?? "human");

  // Features toggles
  const [enableRag, setEnableRag] = useState(botSettings?.enableRag ?? true);
  const [enableOrders, setEnableOrders] = useState(botSettings?.enableOrders ?? true);
  const [enableEmoji, setEnableEmoji] = useState(botSettings?.enableEmoji ?? true);
  const [outsideHoursMsg, setOutsideHoursMsg] = useState(
    botSettings?.outsideHoursMsg ?? "We are currently closed. We'll be back during business hours!"
  );
  const [orderConfirmTpl, setOrderConfirmTpl] = useState(
    botSettings?.orderConfirmTpl ?? "✅ Your order #{id} has been received! We'll contact you shortly."
  );

  // Business hours
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    (botSettings?.businessHours as BusinessHours) ?? DEFAULT_HOURS
  );

  // Auto-replies
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>(
    (botSettings?.autoReplies as AutoReply[]) ?? []
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [newReply, setNewReply] = useState("");
  const [newExact, setNewExact] = useState(false);

  function addAutoReply() {
    if (!newKeyword.trim() || !newReply.trim()) return;
    setAutoReplies((r) => [...r, { keyword: newKeyword.trim(), reply: newReply.trim(), exact: newExact }]);
    setNewKeyword("");
    setNewReply("");
    setNewExact(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/bot-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        systemPrompt, tone, language, welcomeMessage: welcomeMessage || null,
        fallbackMessage: fallbackMessage || null, humanTrigger,
        enableRag, enableOrders, enableEmoji,
        outsideHoursMsg: outsideHoursMsg || null,
        orderConfirmTpl: orderConfirmTpl || null,
        businessHours, autoReplies,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">

        {/* ── PERSONALITY ── */}
        {tab === "personality" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="You are a helpful sales assistant for..."
              />
              <p className="text-xs text-muted-foreground">
                Describe your bot's role, what it sells, and any specific instructions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[["friendly","😊 Friendly"],["professional","💼 Professional"],["casual","🤙 Casual"],["formal","🎩 Formal"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[["en","🇬🇧 English"],["uk","🇺🇦 Ukrainian"],["ru","🇷🇺 Russian"],["de","🇩🇪 German"],["es","🇪🇸 Spanish"],["fr","🇫🇷 French"],["pl","🇵🇱 Polish"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Human Trigger Word</label>
                <input
                  type="text"
                  value={humanTrigger}
                  onChange={(e) => setHumanTrigger(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="human"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Welcome Message</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Hello! Welcome to our store 👋"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fallback Message</label>
                <textarea
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Sorry, I didn't understand. Can you rephrase?"
                />
              </div>
            </div>
          </>
        )}

        {/* ── BUSINESS HOURS ── */}
        {tab === "hours" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The bot will respond normally during active hours. Outside hours it sends the message below.
            </p>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const h = businessHours[day] ?? { active: false, start: "09:00", end: "18:00" };
                return (
                  <div key={day} className={cn("flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors",
                    h.active ? "border-primary/30 bg-primary/3" : "border-border")}>
                    <button
                      onClick={() => setBusinessHours((bh) => ({
                        ...bh, [day]: { ...h, active: !h.active },
                      }))}
                    >
                      {h.active
                        ? <ToggleRight className="h-6 w-6 text-primary" />
                        : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                    </button>
                    <span className="w-10 text-sm font-medium text-foreground">{DAY_LABELS[day]}</span>
                    {h.active ? (
                      <>
                        <input
                          type="time"
                          value={h.start}
                          onChange={(e) => setBusinessHours((bh) => ({
                            ...bh, [day]: { ...h, start: e.target.value },
                          }))}
                          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-muted-foreground text-sm">—</span>
                        <input
                          type="time"
                          value={h.end}
                          onChange={(e) => setBusinessHours((bh) => ({
                            ...bh, [day]: { ...h, end: e.target.value },
                          }))}
                          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Outside Hours Message</label>
              <textarea
                value={outsideHoursMsg}
                onChange={(e) => setOutsideHoursMsg(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        )}

        {/* ── AUTO-REPLIES ── */}
        {tab === "autoreplies" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              When a message contains a keyword, the bot instantly replies with the set text — no LLM call needed.
            </p>

            {/* Existing rules */}
            {autoReplies.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                No auto-replies yet. Add your first one below.
              </p>
            )}
            {autoReplies.map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded border border-border">
                      {r.keyword}
                    </span>
                    {r.exact && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        exact match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{r.reply}</p>
                </div>
                <button
                  onClick={() => setAutoReplies((rs) => rs.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add new */}
            <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add rule</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Keyword / trigger</label>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="price, delivery, menu..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reply text</label>
                  <input
                    type="text"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Our delivery is free over $30!"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExact}
                    onChange={(e) => setNewExact(e.target.checked)}
                    className="rounded border-input"
                  />
                  Exact match only
                </label>
                <button
                  onClick={addAutoReply}
                  disabled={!newKeyword.trim() || !newReply.trim()}
                  className="flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" /> Add rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FEATURES ── */}
        {tab === "features" && (
          <div className="space-y-4">
            {[
              { label: "RAG Product Search", desc: "Bot answers product questions using your catalog", value: enableRag, set: setEnableRag },
              { label: "Order Placement", desc: "Bot can extract and create orders from messages", value: enableOrders, set: setEnableOrders },
              { label: "Use Emoji", desc: "Bot adds relevant emoji to responses", value: enableEmoji, set: setEnableEmoji },
            ].map(({ label, desc, value, set }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-border px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <button onClick={() => set(!value)}>
                  {value
                    ? <ToggleRight className="h-7 w-7 text-primary" />
                    : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                </button>
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Order Confirmation Template</label>
              <textarea
                value={orderConfirmTpl}
                onChange={(e) => setOrderConfirmTpl(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Use <code className="bg-secondary px-1 rounded">{"{id}"}</code> for order ID,{" "}
                <code className="bg-secondary px-1 rounded">{"{items}"}</code> for items list.
              </p>
            </div>
          </div>
        )}

        {/* Save button — always visible */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saved ? "✓ Saved!" : "Save changes"}
          </button>
          {saved && <p className="text-xs text-green-600">All settings applied</p>}
        </div>
      </div>
    </div>
  );
}
