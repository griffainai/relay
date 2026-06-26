"use client";
import { useStore, accessibleSpaces } from "@/lib/store";
import { needsYou } from "@/lib/types";
import { OPERATORS } from "@/lib/studio";
import { Sparkline, AreaChart, Donut } from "../Charts";

// deterministic "trend" series so the demo looks alive without real time-series
function series(seed: number, end: number, n = 8): number[] {
  const out: number[] = [];
  let v = Math.max(1, Math.round(end * 0.55));
  for (let i = 0; i < n; i++) {
    v += ((seed * (i + 3)) % 5) - 1.6;
    out.push(Math.max(0, Math.round(v)));
  }
  out[n - 1] = end;
  return out;
}

export function AnalyticsView() {
  const { state } = useStore();
  const spaces = accessibleSpaces(state.role);
  const all = state.tasks.filter((t) => spaces.some((s) => s.slug === t.spaceSlug));
  const open = all.filter((t) => t.status !== "complete").length;
  const done = all.filter((t) => t.status === "complete").length;
  const needs = all.filter(needsYou).length;
  const byRelay = all.filter((t) => t.status === "complete" && t.completedBy === "relay").length;
  const rate = open + done ? Math.round((done / (open + done)) * 100) : 0;
  const max = Math.max(1, ...spaces.map((s) => all.filter((t) => t.spaceSlug === s.slug).length));

  const statusSeg = [
    { label: "Outstanding", value: all.filter((t) => t.status === "outstanding").length, color: "#DC2626" },
    { label: "In progress", value: all.filter((t) => t.status === "in-progress").length, color: "#F59E0B" },
    { label: "Waiting", value: all.filter((t) => t.status === "waiting-on").length, color: "#76767B" },
    { label: "Complete", value: done, color: "#1F7A4D" },
  ];

  const kpis = [
    { label: "Open tasks", value: open, delta: "-12%", up: false, spark: series(2, open) },
    { label: "Completed", value: done, delta: "+34%", up: true, spark: series(5, done), color: "var(--ok)" },
    { label: "Cleared by Relay", value: byRelay, delta: "+61%", up: true, spark: series(7, byRelay), color: "var(--clay)" },
    { label: "Needs you", value: needs, delta: "-40%", up: false, spark: series(3, needs), color: "var(--crit)" },
  ];

  const team = OPERATORS.map((o) => ({ o, n: all.filter((t) => t.status === "complete" && t.completedBy === o.id).length }));
  const teamMax = Math.max(1, ...team.map((t) => t.n));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <h2 className="text-[22px] font-light tracking-tight text-ink">Analytics</h2>
            <p className="text-[12.5px] text-muted">Operations across your spaces · trailing 30 days</p>
          </div>
          <div className="ml-auto flex gap-1">
            {["7d", "30d", "90d"].map((r, i) => <span key={r} className={`text-[12px] px-2.5 py-1 rounded-md ${i === 1 ? "bg-soft text-ink font-medium" : "text-muted border border-line"}`}>{r}</span>)}
          </div>
        </div>

        <div className="flex gap-1.5">
          {["Operations", "Revenue", "Customers", "Goals"].map((t, i) => (
            <span key={t} className={`text-[12.5px] px-3 py-1.5 rounded-md ${i === 0 ? "bg-ink text-paper font-medium" : "text-muted border border-line"}`}>{t}{i > 0 && " 🔒"}</span>
          ))}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-line bg-paper p-3.5">
              <div className="flex items-start justify-between mb-1">
                <span className="text-[11.5px] text-muted">{k.label}</span>
                <span className={`text-[10.5px] font-medium ${k.up ? "text-ok" : "text-crit"}`}>{k.up ? "▲" : "▼"} {k.delta.replace(/[-+]/, "")}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-[26px] font-light leading-none" style={{ color: k.color ?? "var(--ink)" }}>{k.value}</span>
                <Sparkline data={k.spark} color={k.color ?? "var(--ink-2)"} />
              </div>
            </div>
          ))}
        </div>

        {/* charts row */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 rounded-lg border border-line bg-paper p-4">
            <div className="flex items-center justify-between mb-3"><span className="eyebrow text-muted">Throughput</span><span className="text-[11px] text-muted">completed / period</span></div>
            <AreaChart data={series(5, done, 10)} />
          </div>
          <div className="col-span-2 rounded-lg border border-line bg-paper p-4">
            <div className="eyebrow text-muted mb-3">Status mix</div>
            <Donut segments={statusSeg} />
          </div>
        </div>

        {/* tasks by space + team productivity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line bg-paper p-4">
            <div className="eyebrow text-muted mb-3">Tasks by space</div>
            <div className="space-y-2.5">
              {spaces.map((s) => {
                const c = all.filter((t) => t.spaceSlug === s.slug).length;
                return (
                  <div key={s.slug} className="flex items-center gap-3">
                    <span className="text-[12px] text-ink-2 w-24 shrink-0 truncate">{s.name}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-soft overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(c / max) * 100}%`, background: s.color }} /></div>
                    <span className="text-[11px] text-muted w-5 text-right">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-paper p-4">
            <div className="eyebrow text-muted mb-3">Who's closing work</div>
            <div className="space-y-2.5">
              {team.map(({ o, n }) => (
                <div key={o.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full text-white text-[10px] font-semibold flex items-center justify-center shrink-0" style={{ background: o.color }}>{o.isAgent ? "R" : o.name[0]}</span>
                  <span className="text-[12px] text-ink-2 w-12">{o.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-soft overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(n / teamMax) * 100}%`, background: o.color }} /></div>
                  <span className="text-[11px] text-muted w-5 text-right">{n}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-clay mt-2.5">Relay is closing the most routine work — by design.</div>
          </div>
        </div>

        {/* completion rate + locked */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line bg-paper p-4">
            <div className="flex items-center justify-between mb-1.5"><span className="eyebrow text-muted">Completion rate</span><span className="text-[13px] text-ink font-medium">{rate}%</span></div>
            <div className="h-2 rounded-full bg-soft overflow-hidden"><div className="h-full bg-ok rounded-full" style={{ width: `${rate}%` }} /></div>
            <div className="text-[11px] text-muted mt-2">Goal: 80% · {rate >= 80 ? "on track" : "below target"}</div>
          </div>
          <div className="rounded-lg border border-dashed border-line p-4 flex items-center text-[12.5px] text-muted">
            <span><span className="text-ink-2 font-medium">Revenue · Customers · Goals</span> — wired in the full command center (Stripe + CRM). Hidden in the demo.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
