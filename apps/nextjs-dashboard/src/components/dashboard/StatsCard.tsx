interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
