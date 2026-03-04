import { IconCheckCircle, IconPlusCircle, IconXCircle } from '@/components/ui/Icons';
import { formatRelativeTime } from '@/lib/utils/dates';
import type { ActivityEntry, ActivityType } from '@/types';

interface ProjectActivityTimelineProps {
  activity: ActivityEntry[];
}

const activityConfig: Record<ActivityType, { icon: typeof IconCheckCircle; label: string; colorClass: string }> = {
  completed: { icon: IconCheckCircle, label: 'Completed', colorClass: 'text-success' },
  added: { icon: IconPlusCircle, label: 'Added', colorClass: 'text-[#4A8FD4]' },
  let_go: { icon: IconXCircle, label: 'Let go', colorClass: 'text-danger' },
};

export function ProjectActivityTimeline({ activity }: ProjectActivityTimelineProps) {
  if (activity.length === 0) {
    return (
      <div className="px-7 pb-6">
        <h3 className="section-label mb-3">Recent Activity</h3>
        <p className="text-sm text-muted-foreground/60">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="px-7 pb-6">
      <h3 className="section-label mb-3">Recent Activity</h3>
      <div className="space-y-2.5">
        {activity.map((entry) => {
          const config = activityConfig[entry.type];
          const Icon = config.icon;
          return (
            <div key={entry.id} className="flex items-start gap-2.5">
              <Icon size={15} className={`${config.colorClass} shrink-0 mt-0.5`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-ui leading-snug">
                  <span className="text-muted-foreground">{config.label}:</span>{' '}
                  <span className="text-foreground">{entry.taskTitle}</span>
                </p>
                <p className="text-xs font-mono text-muted-foreground/60 mt-0.5">
                  {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
