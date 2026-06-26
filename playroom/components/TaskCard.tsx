"use client";
import { Avatar } from "./Avatar";
import { TaskChip } from "./StatusChip";
import { PRIORITY_PILL, checklistProgress, stickyColor, stickyInk, tilt } from "@/lib/board";
import { LABELS } from "@/lib/studio";
import type { Task } from "@/lib/types";

export function TaskCard({
  t,
  active,
  onClick,
}: {
  t: Task;
  active?: boolean;
  onClick?: () => void;
}) {
  const pill = PRIORITY_PILL[t.priority];
  const prog = checklistProgress(t.checklist);
  const rot = tilt(t.id);
  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-[6px] p-3 transition-all duration-200 animate-lane-in hover:-translate-y-0.5 ${
        active ? "ring-2 ring-clay" : ""
      }`}
      style={{
        background: stickyColor(t.priority),
        color: stickyInk(),
        transform: `rotate(${rot}deg)`,
        boxShadow: active
          ? "0 8px 20px rgba(11,11,12,0.18)"
          : "0 1px 2px rgba(11,11,12,0.18), 0 6px 14px rgba(11,11,12,0.06)",
      }}
    >
      <span
        className="absolute inset-0 rounded-[6px] pointer-events-none group-hover:rotate-0"
        style={{ transform: `rotate(${-rot}deg)`, transformOrigin: "center" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10.5px] opacity-50">{t.id}</span>
          {pill && (
            <span
              className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: pill.bg, color: pill.fg }}
            >
              {pill.label}
            </span>
          )}
        </div>

        <div className="text-[13.5px] font-medium leading-snug mb-2">{t.title}</div>

        {t.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {t.labels.map((name) => {
              const l = LABELS.find((x) => x.name === name);
              return (
                <span
                  key={name}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border"
                  style={{ borderColor: `${l?.color ?? "#999"}66`, color: l?.color ?? "#555", background: `${l?.color ?? "#999"}14` }}
                >
                  {name}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] opacity-70 mb-2">
          {prog && <span className="font-mono">✓ {prog}</span>}
          {t.completionNote && t.status === "complete" && <span className="font-mono">✓ note</span>}
          {t.comments.length > 0 && <span className="font-mono">💬 {t.comments.length}</span>}
        </div>

        <div className="flex items-center justify-between">
          <Avatar id={t.assignee} size={20} ring />
          <TaskChip task={t} />
        </div>
      </div>
    </button>
  );
}
