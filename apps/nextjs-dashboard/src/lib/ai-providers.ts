export interface AiModel {
  id: string;
  name: string;
  desc: string;
  badge?: string;
}

export interface AiProvider {
  id: string;
  name: string;
  tagline: string;
  color: string;
  bg: string;
  models: AiModel[];
}

export const AI_PROVIDERS: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    tagline: "ChatGPT & GPT-4",
    color: "#10a37f",
    bg: "#f0fdf9",
    models: [
      { id: "gpt-4o",      name: "GPT-4o",       desc: "Most capable multimodal model", badge: "Best" },
      { id: "gpt-4o-mini", name: "GPT-4o mini",  desc: "Fast & cost-efficient",         badge: "Popular" },
      { id: "o1-mini",     name: "o1-mini",       desc: "Advanced reasoning",            badge: "New" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "Legacy, very cheap" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    tagline: "European open AI",
    color: "#ff7000",
    bg: "#fff7f0",
    models: [
      { id: "mistral-large-latest",  name: "Mistral Large",  desc: "Flagship model",      badge: "Best" },
      { id: "mistral-medium-latest", name: "Mistral Medium", desc: "Balanced performance" },
      { id: "mistral-small-latest",  name: "Mistral Small",  desc: "Fast & affordable",   badge: "Popular" },
      { id: "open-mistral-7b",       name: "Mistral 7B",     desc: "Open-source, free" },
    ],
  },
  {
    id: "google",
    name: "Google AI",
    tagline: "Gemini models",
    color: "#4285f4",
    bg: "#f0f4ff",
    models: [
      { id: "gemini-2.0-flash",  name: "Gemini 2.0 Flash", desc: "Latest, very fast",   badge: "New" },
      { id: "gemini-1.5-pro",    name: "Gemini 1.5 Pro",   desc: "Long context (1M tok)", badge: "Best" },
      { id: "gemini-1.5-flash",  name: "Gemini 1.5 Flash", desc: "Fast & affordable" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tagline: "Claude models",
    color: "#c96442",
    bg: "#fff4f0",
    models: [
      { id: "claude-opus-4-7",    name: "Claude Opus 4.7",    desc: "Most powerful",      badge: "Best" },
      { id: "claude-sonnet-4-6",  name: "Claude Sonnet 4.6",  desc: "Balanced",           badge: "Popular" },
      { id: "claude-haiku-4-5",   name: "Claude Haiku 4.5",   desc: "Fast & lightweight" },
    ],
  },
];

export const MESSENGER_CONFIGS = [
  {
    type: "TELEGRAM",
    name: "Telegram",
    icon: "✈️",
    color: "#229ed9",
    bg: "#f0f8ff",
    tokenLabel: "Bot Token",
    tokenPlaceholder: "1234567890:AAF...",
    helpUrl: "https://core.telegram.org/bots#how-do-i-create-a-bot",
    helpText: "Get from @BotFather → /newbot",
    extraFields: [] as { key: string; label: string; placeholder: string }[],
  },
  {
    type: "WHATSAPP",
    name: "WhatsApp",
    icon: "💬",
    color: "#25d366",
    bg: "#f0fff4",
    tokenLabel: "Access Token",
    tokenPlaceholder: "EAABsbC...",
    helpUrl: "https://developers.facebook.com/docs/whatsapp",
    helpText: "From Meta Business → WhatsApp → API Setup",
    extraFields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789" },
      { key: "verifyToken",   label: "Webhook Verify Token", placeholder: "my_secret_token" },
    ],
  },
  {
    type: "INSTAGRAM",
    name: "Instagram",
    icon: "📸",
    color: "#e1306c",
    bg: "#fff0f5",
    tokenLabel: "Page Access Token",
    tokenPlaceholder: "EAABsbC...",
    helpUrl: "https://developers.facebook.com/docs/instagram-api",
    helpText: "From Meta Business → Instagram → Messaging",
    extraFields: [
      { key: "pageId", label: "Instagram Page ID", placeholder: "987654321" },
    ],
  },
  {
    type: "VIBER",
    name: "Viber",
    icon: "📱",
    color: "#7360f2",
    bg: "#f4f0ff",
    tokenLabel: "Auth Token",
    tokenPlaceholder: "xxxxxxxx-...",
    helpUrl: "https://developers.viber.com/docs/api/rest-bot-api/",
    helpText: "From Viber Admin Panel → Create Bot",
    extraFields: [] as { key: string; label: string; placeholder: string }[],
  },
];
