"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@foxai.io");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--sidebar-bg))] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <span className="text-white text-xl font-bold tracking-tight">FoxAi</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              AI-powered sales<br />for your business
            </h1>
            <p className="text-[hsl(var(--sidebar-fg))] text-lg leading-relaxed">
              Automate customer service and orders via Telegram & WhatsApp using intelligent AI agents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Orders automated", value: "10k+" },
              { label: "Response time", value: "<2s" },
              { label: "Languages", value: "10+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-bold text-2xl">{stat.value}</p>
                <p className="text-[hsl(var(--sidebar-fg))] text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[hsl(var(--sidebar-fg))] text-sm">
          © 2026 FoxAi. All rights reserved.
        </p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-foreground text-xl font-bold">FoxAi</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your merchant account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Demo: <span className="font-mono">demo@foxai.io</span> / any password
          </p>
        </div>
      </div>
    </div>
  );
}
