"use client";
import { Markdown } from "../Markdown";
import { useStore } from "@/lib/store";
import { SCHOOL } from "@/lib/promo";

const FILES = [
  {
    name: "CLAUDE.md",
    tag: "Layer 1 · the map",
    body: "Always loaded. Holds no knowledge — only directions. The routing table says *when X, read Y, then Z*. One screen.",
  },
  {
    name: "identity.md",
    tag: "who it is",
    body: "**Most tools track. You finish.** Relay is the completion engine — it does the routine work and escalates what needs a human.",
  },
  {
    name: "rules.md",
    tag: "the law",
    body: "**Sort before you work.** Every request → 🟢 CLEAR / 🟡 HOLD / 🔴 ESCALATE. A refusal list. This file *is* the engine running this demo.",
  },
  {
    name: "reference/playbook.md",
    tag: "the boundary of autonomy",
    body: "The request types Relay may CLEAR. Not in the list → escalate. Relay never widens its own authority.",
  },
  {
    name: "rooms/*/CONTEXT.md",
    tag: "Layer 2 · the rooms",
    body: "Loaded when entering a stage — intake · delivery · escalations · standup.",
  },
  {
    name: "skills/*/SKILL.md",
    tag: "Layer 3 · the skills",
    body: "Loaded only when a task needs one — copy-edit · content-update · page-change · seo-meta.",
  },
];

export function BrainView() {
  const { dispatch } = useStore();
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[22px] font-light tracking-tight text-ink mb-1">The Brain</h2>
        <p className="text-[13.5px] text-muted mb-2">
          Everything you just watched is driven by a folder — three layers of markdown. This is the
          tip of the iceberg: the full system is 45 files.
        </p>
        <div className="rounded-md border border-clay/30 bg-clay/[0.04] p-3 mb-5 text-[12.5px] text-ink-2">
          The recursion: Relay is an <span className="text-clay">ICM-defined agent</span> that operates
          on an <span className="text-clay">ICM-structured studio</span>. The methodology runs the
          worker <em>and</em> models the work.
        </div>
        <div className="space-y-2.5">
          {FILES.map((f) => (
            <div key={f.name} className="rounded-lg border border-line bg-paper p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[12.5px] text-ink">{f.name}</span>
                <span className="eyebrow text-muted">{f.tag}</span>
              </div>
              <Markdown>{f.body}</Markdown>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-clay/30 bg-clay/[0.05] p-5">
          <div className="eyebrow text-clay mb-1.5">The part that's on you</div>
          <h3 className="text-[17px] font-medium text-ink mb-1.5">This structure is free. The quality is the folder you build.</h3>
          <p className="text-[13px] text-ink-2 leading-relaxed mb-3">Claude is only ever as good as the folder you hand it — the context, the standards, the taste, the examples of “good”. That depth is the craft, and it's the methodology: ICM. We give you the structure; you bring the substance.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => dispatch({ type: "builder", on: true })} className="bg-clay text-white text-[13px] px-4 py-2 rounded-md font-medium hover:opacity-90">Build your folder →</button>
            <a href={SCHOOL.url} target="_blank" rel="noreferrer" className="text-[13px] text-ink-2 border border-line px-4 py-2 rounded-md hover:text-ink hover:border-ink-2/50">Learn ICM in {SCHOOL.name} →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
