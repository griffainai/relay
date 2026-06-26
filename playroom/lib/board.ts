import type { Priority, TaskStatus } from "./types";

export const STATUS_LANES: { status: TaskStatus; label: string; dot: string }[] = [
  { status: "outstanding", label: "Outstanding", dot: "#DC2626" },
  { status: "in-progress", label: "In Progress", dot: "#F59E0B" },
  { status: "waiting-on", label: "Waiting On", dot: "#76767B" },
  { status: "needs-review", label: "Needs review", dot: "#3B6CB7" },
  { status: "complete", label: "Complete", dot: "#1F7A4D" },
];

export function statusLabel(s: TaskStatus): string {
  return STATUS_LANES.find((l) => l.status === s)?.label ?? s;
}
export function statusDot(s: TaskStatus): string {
  return STATUS_LANES.find((l) => l.status === s)?.dot ?? "#76767B";
}

/** Sticky notes are always light "paper" (in both themes) so they pop. */
export function stickyColor(p: Priority): string {
  return { p0: "#FEE2E2", p1: "#FEF3C7", p2: "#DCFCE7", p3: "#E8EAED" }[p];
}
export function stickyInk(): string {
  return "#1A1A1C"; // sticky notes are light → dark ink always
}

/** Deterministic ±1.6° tilt from the task id — the hand-pinned feel. */
export function tilt(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 33) - 16) / 10; // -1.6 .. 1.6
}

export const PRIORITY_PILL: Record<Priority, { label: string; bg: string; fg: string } | null> = {
  p0: { label: "High", bg: "#FECACA", fg: "#991B1B" },
  p1: { label: "Med", bg: "#FDE68A", fg: "#92400E" },
  p2: null,
  p3: null,
};

export function checklistProgress(items: { done: boolean }[]): string | null {
  if (!items.length) return null;
  return `${items.filter((i) => i.done).length}/${items.length}`;
}
