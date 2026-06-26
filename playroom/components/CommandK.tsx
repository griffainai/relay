"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, View, accessibleSpaces } from "@/lib/store";

interface Cmd { label: string; hint: string; run: (d: ReturnType<typeof useStore>["dispatch"]) => void; }

export function CommandK() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const cmds: Cmd[] = useMemo(() => {
    const views: { v: View; label: string }[] = [
      { v: "board", label: "Board" }, { v: "cockpit", label: "Cockpit — what needs you" },
      { v: "activity", label: "Activity" }, { v: "brain", label: "The Brain — how it thinks" },
    ];
    return [
      ...views.map((x) => ({ label: `Go to ${x.label}`, hint: "view", run: (d: any) => d({ type: "view", view: x.v }) })),
      ...(state.role !== "client" ? [{ label: "All spaces", hint: "space", run: (d: any) => d({ type: "space", slug: "all" }) }] : []),
      ...accessibleSpaces(state.role).map((s) => ({ label: `Switch to ${s.name}${s.kind === "executive" ? " (exec)" : ""}`, hint: "space", run: (d: any) => d({ type: "space", slug: s.slug }) })),
      { label: "Take the tour", hint: "action", run: (d: any) => d({ type: "tour", step: 0 }) },
    ];
  }, [state.role]);

  const filtered = useMemo(() => cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase())), [cmds, q]);

  useEffect(() => { if (state.cmdk) { setQ(""); setI(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [state.cmdk]);
  if (!state.cmdk) return null;
  const close = () => dispatch({ type: "cmdk", on: false });
  const choose = (c?: Cmd) => { if (!c) return; c.run(dispatch); close(); };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[18vh]" onClick={close}>
      <div className="absolute inset-0 bg-ink/30" />
      <div className="relative w-[520px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl overflow-hidden animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowDown") { e.preventDefault(); setI((p) => Math.min(p + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setI((p) => Math.max(p - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); choose(filtered[i]); }
          }}
          placeholder="Jump to a view or space…" className="w-full px-4 py-3.5 bg-paper text-[14px] text-ink placeholder:text-muted outline-none border-b border-line" />
        <div className="max-h-[300px] overflow-y-auto py-1.5">
          {filtered.map((c, idx) => (
            <button key={c.label} onMouseEnter={() => setI(idx)} onClick={() => choose(c)} className={`w-full text-left px-4 py-2 flex items-center gap-2 ${idx === i ? "bg-soft" : ""}`}>
              <span className="text-[13.5px] text-ink">{c.label}</span>
              <span className="ml-auto text-[10px] text-muted uppercase tracking-wider">{c.hint}</span>
            </button>
          ))}
          {filtered.length === 0 && <div className="px-4 py-3 text-[13px] text-muted">No matches.</div>}
        </div>
      </div>
    </div>
  );
}
