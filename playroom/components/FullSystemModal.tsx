"use client";
import { useStore } from "@/lib/store";

const FEATURES: Record<string, { title: string; body: string }> = {
  calendar: {
    title: "Calendar → the admin's cost view",
    body: "A shared calendar that schedules client work and meetings — and because every task carries time and a rate, the week rolls straight into billing and the admin's cost view. The studio's schedule and exactly what it costs, in one place.",
  },
  costs: {
    title: "Costs board (executives only)",
    body: "Spend, AR aging, MRR, refunds, and who-owes-whom between partners — gated to the executive tier. The money view founders actually run the business on.",
  },
  decisions: {
    title: "Decision log",
    body: "Every kill / pause / double-down recorded with context and rationale, at empire / space / project scope. A durable trail of the why, not just the what.",
  },
  admin: {
    title: "Org & access admin",
    body: "Invite teammates, set tiers (executive / member / external), and grant per-space roles. The exact access model you tried in “View as” — managed for real.",
  },
};

export function FullSystemModal() {
  const { state, dispatch } = useStore();
  const f = state.fullSystem ? FEATURES[state.fullSystem] : null;
  if (!f) return null;
  const close = () => dispatch({ type: "fullSystem", key: null });
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-6" onClick={close}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative w-[460px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl p-5 animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-clay">In the full system 🔒</span>
          <button onClick={close} aria-label="Close" className="text-muted hover:text-ink text-[16px]">×</button>
        </div>
        <h3 className="text-[19px] font-medium text-ink mb-2 tracking-tight">{f.title}</h3>
        <p className="text-[14px] text-ink-2 leading-relaxed mb-4">{f.body}</p>
        <div className="rounded-md bg-soft border border-line px-3 py-2.5 text-[12.5px] text-muted">
          We kept this demo deliberately specific so it stays clear and easy to follow — this lives in the full command center, not in the demo.
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={close} className="text-[13px] bg-ink text-paper px-4 py-2 rounded-md">Got it</button>
        </div>
      </div>
    </div>
  );
}
