import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: boolean;
}

export function StatsCard({ title, value, description, icon: Icon, trend, accent }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-card transition-shadow hover:shadow-card-hover",
        accent
          ? "bg-primary border-primary text-white"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-xs font-semibold uppercase tracking-wider", accent ? "text-white/70" : "text-muted-foreground")}>
            {title}
          </p>
          <p className={cn("text-3xl font-bold tracking-tight", accent ? "text-white" : "text-foreground")}>
            {value}
          </p>
          {description && (
            <p className={cn("text-xs", accent ? "text-white/70" : "text-muted-foreground")}>
              {description}
            </p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium", trend.positive ? (accent ? "text-white/90" : "text-green-600") : "text-red-500")}>
              {trend.positive ? "+" : ""}{trend.value} this week
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg", accent ? "bg-white/15" : "bg-primary/8")}>
            <Icon className={cn("h-5 w-5", accent ? "text-white" : "text-primary")} />
          </div>
        )}
      </div>
    </div>
  );
}
