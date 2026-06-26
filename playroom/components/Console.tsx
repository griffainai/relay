"use client";
import { useState } from "react";
import { useStore, visibleTasks, accessibleSpaceSlugs } from "@/lib/store";
import { sortRequest, bakedCompletion, SortResult } from "@/lib/lane";
import { liveComplete } from "@/lib/complete";
import { spaceBySlug, PRESETS } from "@/lib/studio";
import { nextTaskId } from "@/lib/id";
import type { Space, Task } from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function title(raw: string): string {
  const t = raw.trim().replace(/^(can we|can you|could you|please|hey,?|oh,? and|also,?)\s+/i, "");
  const s = t.charAt(0).toUpperCase() + t.slice(1);
  const c = s.replace(/[?.!]+$/, "");
  return c.length > 48 ? c.slice(0, 48).trim() + "…" : c;
}
function detectSpace(raw: string, active: string): string {
  if (/acme/i.test(raw)) return "acme-studio";
  if (/northwind|dana|hvac|heating|cooling/i.test(raw)) return "northwind";
  return active !== "all" && active !== "executive" ? active : "northwind";
}
async function applySort(t: Task, sort: SortResult, space: Space, apiKey?: string): Promise<Partial<Task>> {
  let content: ReturnType<typeof bakedCompletion>;
  if (apiKey) {
    try {
      const live = await liveComplete({ apiKey, raw: t.description, sort, space });
      content = sort.outcome === "clear" ? { deliverable: { title: "Deliverable", body: live.body }, completionNote: "Completed live by Relay." } : sort.outcome === "needs-you" ? { escalation: live.body } : { holdQuestion: live.body };
    } catch {
      content = bakedCompletion(t.description, sort, space);
    }
  } else {
    content = bakedCompletion(t.description, sort, space);
  }
  const base = { reason: sort.reason, playbook: sort.playbook };
  if (sort.outcome === "clear") return { ...base, status: "complete", completedBy: "relay", completedAt: "just now", deliverable: content.deliverable, completionNote: content.completionNote };
  if (sort.outcome === "needs-you") return { ...base, escalation: content.escalation };
  return { ...base, status: "waiting-on", holdQuestion: content.holdQuestion };
}

export function Console() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  async function intake(raw: string) {
    if (!raw.trim() || running) return;
    setRunning(true);
    dispatch({ type: "typing", who: "relay" });
    setLog([]);
    const allowed = accessibleSpaceSlugs(state.role);
    let slug = detectSpace(raw, state.activeSpace);
    if (!allowed.includes(slug)) slug = allowed[0];
    const space = spaceBySlug(slug)!;
    const id = nextTaskId();
    const task: Task = { id, spaceSlug: slug, projectName: "Marketing site", title: title(raw), description: raw.trim(), priority: "p2", status: "outstanding", assignee: null, labels: [], checklist: [], origin: "client", filedBy: "client (demo)", comments: [] };
    dispatch({ type: "add", task });
    setText("");
    setLog((l) => [...l, `Intake — “${task.title}”`]);
    await delay(600);
    const sort = sortRequest(raw);
    setLog((l) => [...l, `Sorted ${sort.outcome === "clear" ? "🟢 clear" : sort.outcome === "needs-you" ? "🔴 escalate" : "🟡 hold"} — ${sort.reason}`]);
    await delay(650);
    const patch = await applySort(task, sort, space, state.apiKey);
    dispatch({ type: "update", id, patch });
    dispatch({ type: "select", id });
    setLog((l) => [...l, sort.outcome === "clear" ? "Completed. Note written." : sort.outcome === "needs-you" ? "Escalated with a recommendation." : "Held for one question."]);
    dispatch({ type: "typing", who: null });
    setRunning(false);
  }

  async function runAll() {
    if (running) return;
    const targets = visibleTasks(state).filter((t) => t.spaceSlug !== "executive" && t.status !== "complete" && !t.escalation && !t.holdQuestion);
    if (!targets.length) { setLog(["Nothing to run — the board's clear."]); return; }
    setRunning(true);
    dispatch({ type: "typing", who: "relay" });
    setLog([`Running ${targets.length} task${targets.length > 1 ? "s" : ""}…`]);
    for (const t of targets) {
      const space = spaceBySlug(t.spaceSlug)!;
      const sort = sortRequest(t.description);
      await delay(700);
      const patch = await applySort(t, sort, space, state.apiKey);
      dispatch({ type: "update", id: t.id, patch });
      setLog((l) => [...l, `${t.id} → ${sort.outcome === "clear" ? "🟢 completed" : sort.outcome === "needs-you" ? "🔴 escalated to you" : "🟡 held"}`]);
    }
    setLog((l) => [...l, "Sweep done. Routine cleared; judgment calls are yours."]);
    dispatch({ type: "typing", who: null });
    setRunning(false);
  }

  return (
    <div data-demo="console" className="border border-line rounded-lg bg-paper p-3.5 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="eyebrow text-clay">Relay console</span>
        <span className="text-[11px] text-muted">{state.apiKey ? "live · your key" : "baked · offline"}</span>
        <button data-demo="run-tasks" onClick={runAll} disabled={running} className="ml-auto text-[12px] font-medium bg-clay text-white px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50">
          {running ? "Running…" : "▶ Run tasks"}
        </button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); intake(text); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} disabled={running} placeholder="Or type a client request in plain language…" className="flex-1 bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink placeholder:text-muted outline-none focus:border-ink-2/50 disabled:opacity-60" />
        <button type="submit" disabled={running || !text.trim()} className="px-3.5 py-2 rounded-md bg-ink text-paper text-[13px] font-medium disabled:opacity-40">Send →</button>
      </form>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {PRESETS.map((p) => (
          <button key={p.label} disabled={running} onClick={() => intake(p.text)} className="text-[11px] px-2 py-0.5 rounded-full border border-line text-ink-2 hover:text-ink hover:border-ink-2/50 disabled:opacity-40">{p.label}</button>
        ))}
      </div>
      {log.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-line space-y-1">
          {log.map((l, i) => <div key={i} className="text-[12px] font-mono text-ink-2 animate-lane-in"><span className="text-muted">·</span> {l}</div>)}
        </div>
      )}
    </div>
  );
}
