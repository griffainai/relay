"use client";
import { person } from "@/lib/studio";
import type { PersonId, PresenceStatus } from "@/lib/types";

const STATUS_RING: Record<PresenceStatus, string> = {
  active: "#1F7A4D",
  away: "#F59E0B",
  busy: "#DC2626",
  offline: "#8E8E93",
};

export function Avatar({
  id,
  size = 22,
  ring = false,
}: {
  id: PersonId | null | undefined;
  size?: number;
  ring?: boolean;
}) {
  const p = person(id);
  if (!p) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-dashed border-line text-muted"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title="Unassigned"
      >
        ·
      </span>
    );
  }
  const initial = p.isAgent ? "R" : p.name.slice(0, 1);
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: p.color,
        boxShadow: ring ? `0 0 0 2px var(--paper), 0 0 0 3.5px ${STATUS_RING[p.status]}` : undefined,
      }}
      title={`${p.name}${p.isAgent ? " (AI)" : ""} — ${p.status}`}
    >
      {initial}
    </span>
  );
}
