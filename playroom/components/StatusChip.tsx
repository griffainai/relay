import { statusDot, statusLabel } from "@/lib/board";
import type { Task, TaskStatus } from "@/lib/types";
import { needsYou } from "@/lib/types";

export function StatusChip({ status }: { status: TaskStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusDot(status) }} />
      {statusLabel(status)}
    </span>
  );
}

export function NeedsYouChip() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-crit/10 text-crit border border-crit/30">
      ● Needs you
    </span>
  );
}

/** The right chip for a task at a glance. */
export function TaskChip({ task }: { task: Task }) {
  if (needsYou(task)) return <NeedsYouChip />;
  if (task.holdQuestion && task.status !== "complete")
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warn/10 text-warn border border-warn/30">
        ● On hold
      </span>
    );
  return <StatusChip status={task.status} />;
}
