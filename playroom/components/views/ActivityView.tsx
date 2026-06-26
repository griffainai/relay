"use client";
import { useState } from "react";
import { useStore, accessibleSpaces } from "@/lib/store";
import { spaceBySlug, person } from "@/lib/studio";
import { Avatar } from "../Avatar";
import { needsYou, Task } from "@/lib/types";

type Filter = "all" | "completed" | "escalated" | "held" | "discussed";

function kind(t: Task): { f: Filter; verb: string; icon: string; color: string; actor: string | null } {
  if (t.status === "complete") return { f: "completed", verb: "completed", icon: "✓", color: "var(--ok)", actor: t.completedBy ?? null };
  if (needsYou(t)) return { f: "escalated", verb: "escalated", icon: "↑", color: "var(--crit)", actor: "relay" };
  if (t.holdQuestion) return { f: "held", verb: "held for a question", icon: "?", color: "var(--warn)", actor: "relay" };
  return { f: "discussed", verb: "updated", icon: "•", color: "var(--muted)", actor: t.assignee ?? null };
}

export function ActivityView() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const spaces = accessibleSpaces(state.role);
  const scope = state.tasks.filter((t) => spaces.some((s) => s.slug === t.spaceSlug));
  const items = scope.filter((t) => t.status === "complete" || needsYou(t) || t.holdQuestion || t.comments.length);

  const counts = {
    all: items.length,
    completed: items.filter((t) => t.status === "complete").length,
    escalated: items.filter(needsYou).length,
    held: items.filter((t) => t.holdQuestion && t.status !== "complete").length,
    discussed: items.filter((t) => t.comments.length && t.status !== "complete" && !needsYou(t)).length,
  };
  const shown = items.filter((t) => {
    const k = kind(t);
    if (filter !== "all" && k.f !== filter) return false;
    if (q && !(`${t.id} ${t.title}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "All" }, { id: "completed", label: "Completed" },
    { id: "escalated", label: "Escalated" }, { id: "held", label: "On hold" }, { id: "discussed", label: "Discussed" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[22px] font-light tracking-tight text-ink mb-1">Activity</h2>
        <p className="text-[12.5px] text-muted mb-5">Every move — by Alex, Sam, and Relay. The trail is the trust.</p>

        {/* summary strip */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{ n: counts.completed, l: "completed", c: "var(--ok)" }, { n: counts.escalated, l: "escalated", c: "var(--crit)" }, { n: counts.held, l: "on hold", c: "var(--warn)" }, { n: scope.filter((t) => t.completedBy === "relay" && t.status === "complete").length, l: "by Relay", c: "var(--clay)" }].map((m) => (
            <div key={m.l} className="rounded-lg border border-line bg-paper px-3.5 py-2.5">
              <div className="text-[22px] font-light leading-none" style={{ color: m.c }}>{m.n}</div>
              <div className="text-[11px] text-muted mt-1">{m.l}</div>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`text-[12px] px-2.5 py-1 rounded-md ${filter === f.id ? "bg-ink text-paper" : "text-ink-2 border border-line hover:border-ink-2/50"}`}>
                {f.label} <span className="opacity-60">{counts[f.id]}</span>
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity…" className="ml-auto bg-soft border border-line rounded-md px-2.5 py-1 text-[12.5px] text-ink outline-none w-44" />
        </div>

        {/* feed */}
        <div className="rounded-lg border border-line bg-paper divide-y divide-line">
          <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-muted bg-soft/40">Today</div>
          {shown.map((t) => {
            const k = kind(t);
            const s = spaceBySlug(t.spaceSlug);
            return (
              <button key={t.id} onClick={() => { dispatch({ type: "space", slug: t.spaceSlug }); dispatch({ type: "view", view: "board" }); dispatch({ type: "select", id: t.id }); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-soft/40 transition group">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0" style={{ background: `${k.color}1a`, color: k.color }}>{k.icon}</span>
                <Avatar id={k.actor as any} size={20} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-ink-2 truncate">
                    <span className="text-ink font-medium">{person(k.actor)?.name ?? "Someone"}</span> {k.verb} · {t.title}
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-1.5">
                    <span className="font-mono">{t.id}</span><span>·</span>
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: s?.color }} />{s?.name}</span>
                  </div>
                </div>
                <span className="text-[11px] text-muted opacity-0 group-hover:opacity-100">open →</span>
              </button>
            );
          })}
          {shown.length === 0 && <div className="px-4 py-6 text-[13px] text-muted text-center">No activity matches.</div>}
        </div>
      </div>
    </div>
  );
}
