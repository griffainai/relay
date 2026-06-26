"use client";
import { useStore, accessibleSpaces, visibleTasks } from "@/lib/store";
import { person } from "@/lib/studio";
import { Avatar } from "../Avatar";
import { needsYou } from "@/lib/types";

export function CockpitView() {
  const { state, dispatch } = useStore();
  // role-gated: never aggregate beyond what this role can see
  const scope = state.tasks.filter((t) => accessibleSpaces(state.role).some((s) => s.slug === t.spaceSlug));
  const needs = scope.filter(needsYou);
  const holds = scope.filter((t) => t.holdQuestion && t.status !== "complete");
  const done = scope.filter((t) => t.status === "complete");

  const open = (id: string, slug: string) => {
    dispatch({ type: "space", slug });
    dispatch({ type: "view", view: "board" });
    dispatch({ type: "select", id });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-[22px] font-light tracking-tight text-ink mb-1">What needs you</h2>
          <p className="text-[13.5px] text-muted">Across every space. Relay cleared the rest — here's only what's actually yours.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Metric n={needs.length} label="need you" color="var(--crit)" />
          <Metric n={holds.length} label="on hold" color="var(--warn)" />
          <Metric n={done.length} label="completed" color="var(--ok)" />
        </div>

        {needs[0] && (
          <div className="rounded-lg border border-crit/30 bg-crit/[0.03] p-4">
            <div className="eyebrow text-crit mb-2">Do this next</div>
            <div className="flex items-center gap-2 mb-1"><Avatar id={needs[0].assignee} size={18} /><span className="text-[15px] text-ink font-medium">{needs[0].title}</span></div>
            {needs[0].escalation && <pre className="text-[12.5px] font-mono text-ink-2 whitespace-pre-wrap leading-relaxed mt-2">{needs[0].escalation}</pre>}
            <button onClick={() => open(needs[0].id, needs[0].spaceSlug)} className="mt-3 text-[12px] text-clay hover:underline">Open on the board →</button>
          </div>
        )}

        <div>
          <div className="eyebrow text-muted mb-2">Spaces</div>
          <div className="grid grid-cols-3 gap-3">
            {accessibleSpaces(state.role).map((s) => {
              const o = scope.filter((t) => t.spaceSlug === s.slug && needsYou(t)).length;
              return (
                <button key={s.slug} onClick={() => { dispatch({ type: "space", slug: s.slug }); dispatch({ type: "view", view: "board" }); }} className="text-left rounded-lg border border-line bg-paper p-3 hover:shadow-sm transition">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-[14px] font-medium text-ink">{s.name}</span>
                    {s.kind === "executive" && <span className="text-[9px] text-clay">♦ exec</span>}
                  </div>
                  <div className="text-[12px] text-muted">{s.blurb}</div>
                  <div className="text-[11.5px] mt-1.5" style={{ color: o ? "var(--crit)" : "var(--ok)" }}>{o ? `${o} needs you` : "clear"}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ n, label, color }: { n: number; label: string; color: string }) {
  return <div className="rounded-lg border border-line bg-paper p-3.5"><div className="text-[28px] font-light leading-none" style={{ color }}>{n}</div><div className="text-[12px] text-muted mt-1">{label}</div></div>;
}
