"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { RelayMark } from "./RelayMark";

interface Msg { from: "bot" | "you"; text: string }

const KB: { keys: RegExp; a: string }[] = [
  { keys: /(how.*(use|work)|where do i|get started|what do i do)/i, a: "Type a client request in the console, or hit ▶ Run tasks and watch Relay clear the board. Click any card to open it, then flip the “File ·md” tab — it's all markdown. Use “View as” (top bar) to see the Executive, Member, and Client views." },
  { keys: /(why|matter|point|different|better)/i, a: "Most tools *track* work; Relay *finishes* it. The folder is the source of truth — so you own every deliverable, and an AI can run the routine work autonomously while escalating anything that needs judgment." },
  { keys: /(use ?case|what for|who.*for|good for)/i, a: "Agencies & studios fielding client requests, any small team drowning in routine asks, solo operators who want an AI teammate, ops teams that live in docs — anywhere work lives in files." },
  { keys: /(scale|expand|bigger|enterprise|team|grow)/i, a: "It scales to teams: more spaces, more operators, real integrations (Stripe, CRM, calendar), and the agent running across all of it. This demo is the tip — the real system runs a whole multi-company studio." },
  { keys: /(real|fake|demo|production|actually)/i, a: "This is a demo on fabricated data — but the *methodology* is real and runs our actual studio. What you're touching is a slice; the full command center stays private." },
  { keys: /(claude|ai|agent|autonom|upload|terminal)/i, a: "Relay is defined by a folder (identity.md, rules.md, a playbook). Upload that folder to Claude and it reads the rules, clears the routine tasks, writes completion notes, and escalates the rest — no app needed. Watch the guided demo's Claude session to see it." },
  { keys: /(icm|methodology|underneath|folder|how.*built)/i, a: "Interpretable Context Methodology: a Map (CLAUDE.md) routes the agent, Rooms (CONTEXT.md) load per stage of work, and Skills load only per task. The folder behaves like a deep specialist without ever loading everything." },
];
const FALLBACK = "Great question — this is a demo of what's possible. Try the guided walkthrough (the ▶ button), or ask me how to use it, why it matters, or how it scales.";

const CHIPS = ["How do I use it?", "Why does this matter?", "Use cases?", "How does it scale?", "Run it in Claude?"];

export function Chatbot() {
  const { dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Hey — I'm Relay's guide. I can teach you how this works, why it matters, and where it goes. Ask me anything, or tap a question below." }]);
  const [text, setText] = useState("");

  const answer = (q: string) => {
    const hit = KB.find((k) => k.keys.test(q));
    setMsgs((m) => [...m, { from: "you", text: q }, { from: "bot", text: hit ? hit.a : FALLBACK }]);
  };
  const send = () => { if (!text.trim()) return; answer(text.trim()); setText(""); };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-ink text-paper rounded-full pl-3 pr-4 py-2.5 shadow-xl hover:opacity-90" aria-label="Open guide">
        <span className="text-clay"><RelayMark size={18} /></span>
        <span className="text-[13px] font-medium">Learn how it works</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[340px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl flex flex-col animate-lane-in" style={{ height: 440 }}>
      <div className="flex items-center gap-2 px-3.5 h-12 border-b border-line shrink-0">
        <span className="text-clay"><RelayMark size={20} /></span>
        <span className="text-[13.5px] font-medium text-ink">Relay guide</span>
        <span className="text-[10px] uppercase tracking-wider text-clay border border-clay/40 rounded px-1">demo</span>
        <button onClick={() => setOpen(false)} className="ml-auto text-muted hover:text-ink text-[16px]" aria-label="Close">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${m.from === "bot" ? "bg-soft text-ink-2" : "bg-ink text-paper ml-auto"}`}
            dangerouslySetInnerHTML={{ __html: m.text.replace(/\*(.+?)\*/g, "<em>$1</em>") }} />
        ))}
      </div>
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {CHIPS.map((c) => <button key={c} onClick={() => answer(c)} className="text-[11px] px-2 py-0.5 rounded-full border border-line text-ink-2 hover:text-ink hover:border-ink-2/50">{c}</button>)}
      </div>
      <div className="px-3 pb-2 flex gap-1.5">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask the guide…" className="flex-1 bg-soft border border-line rounded-md px-2.5 py-1.5 text-[13px] text-ink outline-none" />
        <button onClick={send} className="text-[12.5px] bg-ink text-paper px-3 rounded-md">Send</button>
      </div>
      <div className="flex items-center justify-center gap-3 pb-2.5">
        <button onClick={() => dispatch({ type: "wall", on: true })} className="text-[11px] text-clay hover:underline">★ See what people say</button>
        <span className="text-line">·</span>
        <button onClick={() => dispatch({ type: "review", on: true })} className="text-[11px] text-clay hover:underline">Rate this demo</button>
      </div>
    </div>
  );
}
