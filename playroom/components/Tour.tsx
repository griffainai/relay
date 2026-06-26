"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

type D = ReturnType<typeof useStore>["dispatch"];

const STEPS: { title: string; body: string; enter?: (d: D) => void }[] = [
  {
    title: "A two-person studio, plus an AI",
    body: "Alex and Sam run the studio; Relay is the third operator. Everyone works the same board. Hit Next, or just start poking around.",
    enter: (d) => { d({ type: "space", slug: "all" }); d({ type: "view", view: "board" }); d({ type: "select", id: undefined }); },
  },
  {
    title: "Run the tasks",
    body: "Hit ▶ Run tasks in the console. Relay sweeps the board — completes the routine work and writes a note, just like a human would.",
    enter: (d) => d({ type: "view", view: "board" }),
  },
  {
    title: "It knows what NOT to touch",
    body: "Try the “Push pricing live” or “Delete a page” chip. Relay refuses and escalates — with a recommendation. That's why you can leave it running.",
    enter: (d) => d({ type: "view", view: "board" }),
  },
  {
    title: "The handoff — Alex ↔ Sam ↔ Relay",
    body: "Relay escalated the pricing task to Alex; Alex pulled in Sam. The whole handoff lives on the task. @mention to pass work between you.",
    enter: (d) => { d({ type: "space", slug: "northwind" }); d({ type: "view", view: "board" }); d({ type: "select", id: "t-104" }); d({ type: "detailTab", tab: "conversation" }); },
  },
  {
    title: "The board is the files",
    body: "Everything you see is markdown. This task IS a file — Relay and the team edit the same one. Flip the “File ·md” tab.",
    enter: (d) => { d({ type: "space", slug: "northwind" }); d({ type: "select", id: "t-101" }); d({ type: "fileMode", on: true }); },
  },
  {
    title: "Clients and Executive, separated",
    body: "Client work and founder-only strategy live in one place, clearly split. Relay clears client work; it escalates executive calls, never decides them.",
    enter: (d) => { d({ type: "fileMode", on: false }); d({ type: "space", slug: "executive" }); d({ type: "view", view: "board" }); d({ type: "select", id: undefined }); },
  },
  {
    title: "The tip of the iceberg",
    body: "All of it runs on a 45-file ICM system — a map, rooms, and skills. Files you own. No signup, no database. That's Relay.",
    enter: (d) => d({ type: "view", view: "brain" }),
  },
];

export function Tour() {
  const { state, dispatch } = useStore();
  const step = state.tour;
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    STEPS[step].enter?.(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  if (step < 0) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <>
      <div className="fixed inset-0 bg-ink/20 z-40" onClick={() => dispatch({ type: "tour", step: -1 })} />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[460px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl p-5 animate-lane-in">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow text-clay">Tour · {step + 1}/{STEPS.length}</span>
          <button onClick={() => dispatch({ type: "tour", step: -1 })} className="text-[11px] text-muted hover:text-ink">Skip</button>
        </div>
        <h3 className="text-[18px] font-medium text-ink mb-1.5 tracking-tight">{s.title}</h3>
        <p className="text-[13.5px] text-ink-2 leading-relaxed mb-4">{s.body}</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {STEPS.map((_, idx) => <span key={idx} className="h-1 rounded-full transition-all" style={{ width: idx === step ? 18 : 6, background: idx === step ? "var(--clay)" : "var(--line)" }} />)}
          </div>
          <div className="ml-auto flex gap-2">
            {step > 0 && <button onClick={() => dispatch({ type: "tour", step: step - 1 })} className="text-[13px] text-ink-2 px-3 py-1.5 rounded-md border border-line hover:border-ink-2/50">Back</button>}
            <button onClick={() => dispatch({ type: "tour", step: last ? -1 : step + 1 })} className="text-[13px] bg-ink text-paper px-3.5 py-1.5 rounded-md hover:opacity-90">{last ? "Finish" : "Next →"}</button>
          </div>
        </div>
      </div>
    </>
  );
}
