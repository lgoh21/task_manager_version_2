interface ProjectStatsGridProps {
  stats: {
    active: number;
    today: number;
    waiting: number;
    done: number;
  };
}

export function ProjectStatsGrid({ stats }: ProjectStatsGridProps) {
  const items = [
    { label: 'Active', value: stats.active, className: 'text-foreground' },
    { label: 'Today', value: stats.today, className: 'text-foreground' },
    { label: 'Waiting', value: stats.waiting, className: 'text-foreground' },
    { label: 'Done', value: stats.done, className: 'text-success' },
  ];

  return (
    <div className="px-7 pt-4 pb-6">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-muted border border-border p-3"
          >
            <p className="font-mono text-xs text-muted-foreground mb-1">
              {item.label}
            </p>
            <p className={`font-heading text-2xl font-semibold ${item.className}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
