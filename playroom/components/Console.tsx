"use client";
import { useState } from "react";
import { useStore, accessibleSpaceSlugs } from "@/lib/store";
import { sortRequest, bakedCompletion } from "@/lib/lane";
import { spaceBySlug, activePresets } from "@/lib/datasets";
import { nextTaskId } from "@/lib/id";
import type { Task } from "@/lib/types";

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

export function Console() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState("");
  const [log, setLog] = useState<string[]>([]);

  function file(raw: string) {
    if (!raw.trim()) return;
    const allowed = accessibleSpaceSlugs(state.role);
    let slug = detectSpace(raw, state.activeSpace);
    if (!allowed.includes(slug)) slug = allowed[0];
    const space = spaceBySlug(slug)!;
    const id = nextTaskId();
    const sort = sortRequest(raw);

    const base: Task = {
      id, spaceSlug: slug, projectName: "Marketing site", title: title(raw), description: raw.trim(),
      priority: "p2", status: "outstanding", assignee: null, labels: [], checklist: [],
      origin: "client", filedBy: "client (demo)", comments: [], reason: sort.reason, playbook: sort.playbook,
    };
    // Relay FILES + FLAGS the request (reading the folder's rules). It does NOT
    // do the work here — that happens manually (open → copy prompt → Claude) or
    // by running the whole folder in the cloud.
    if (sort.outcome === "needs-you") base.escalation = bakedCompletion(raw, sort, space).escalation;
    else if (sort.outcome === "hold") { base.status = "waiting-on"; base.holdQuestion = bakedCompletion(raw, sort, space).holdQuestion; }

    dispatch({ type: "add", task: base });
    dispatch({ type: "select", id });
    setText("");
    const lane = sort.outcome === "clear" ? "🟢 ready to do" : sort.outcome === "needs-you" ? "🔴 needs a human" : "🟡 on hold — one question";
    setLog((l) => [`Filed “${base.title}” → ${lane} (${sort.reason})`, ...l].slice(0, 4));
  }

  return (
    <div data-demo="console" className="border border-line rounded-lg bg-paper p-3.5 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="eyebrow text-clay">Request intake</span>
        <span className="text-[11px] text-muted">a client or teammate asks — Relay files &amp; flags it</span>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); file(text); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a request in plain language…" className="flex-1 bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink placeholder:text-muted outline-none focus:border-ink-2/50" />
        <button type="submit" disabled={!text.trim()} className="px-3.5 py-2 rounded-md bg-ink text-paper text-[13px] font-medium disabled:opacity-40">File it →</button>
      </form>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {activePresets().map((p) => (
          <button key={p.label} onClick={() => file(p.text)} className="text-[11px] px-2 py-0.5 rounded-full border border-line text-ink-2 hover:text-ink hover:border-ink-2/50">{p.label}</button>
        ))}
      </div>
      <div className="text-[11px] text-muted mt-2 flex items-start gap-1.5">
        <span className="text-clay shrink-0">ⓘ</span>
        <span>Relay files &amp; flags requests by reading the folder's rules. To <strong>do</strong> a task: open it → <strong>copy the prompt</strong> → run it in Claude → paste the completion note. Or upload the whole client folder to the cloud and let Claude run them all.</span>
      </div>
      {log.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-line space-y-1">
          {log.map((l, i) => <div key={i} className="text-[12px] font-mono text-ink-2 animate-lane-in"><span className="text-muted">·</span> {l}</div>)}
        </div>
      )}
    </div>
  );
}
