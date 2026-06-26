"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { sortRequest, bakedCompletion } from "@/lib/lane";
import { spaceBySlug, SEED_TASKS } from "@/lib/studio";
import { nextTaskId } from "@/lib/id";
import { RelayMark } from "./RelayMark";

type Phase = "off" | "hook" | "play" | "educate" | "terminal" | "finale";
type Dispatch = ReturnType<typeof useStore>["dispatch"];
interface Rect { top: number; left: number; width: number; height: number }

interface Beat {
  chapter: string;
  title: string; // big header
  text: string; // subtitle
  selector?: string;
  action?: (d: Dispatch, h: { complete: (id: string) => void }) => void;
  dur?: number;
}

const BEATS: Beat[] = [
  { chapter: "Clients are folders", title: "Every client is a folder.", dur: 6000, selector: '[data-demo="rail"]',
    text: "Northwind and Acme each have their own folder. All of a client's work lives there — that's the whole idea.",
    action: (d) => { d({ type: "role", role: "exec" }); d({ type: "space", slug: "all" }); d({ type: "view", view: "board" }); d({ type: "select", id: undefined }); } },
  { chapter: "The client asks", title: "A client sends a request.", dur: 6000, selector: '[data-demo="client-input"]',
    text: "No login, no project tool. The client just asks — in plain language — right here.",
    action: (d) => d({ type: "role", role: "client" }) },
  { chapter: "The client asks", title: "It lands in their folder.", dur: 6000, selector: '[data-demo="client-input"]',
    text: "Their request becomes a file inside that client's folder. Asking and watching the status is all a client can do.",
    action: (d) => d({ type: "add", task: { id: nextTaskId(), spaceSlug: "northwind", title: "Add a 'financing available' note to the pricing page", description: "add a short 'financing available' note on the pricing page", priority: "p2", status: "outstanding", assignee: null, labels: ["copy"], checklist: [], origin: "client", filedBy: "client (Dana)", comments: [] } }) },
  { chapter: "Claude runs the folder", title: "Point Claude at the folder.", dur: 6800, selector: '[data-demo="run-tasks"]',
    text: "Because each client is a folder, Claude knows exactly what to do for that client — it reads the folder's rules. Nothing to configure.",
    action: (d) => { d({ type: "role", role: "exec" }); d({ type: "view", view: "board" }); d({ type: "space", slug: "all" }); d({ type: "select", id: undefined }); } },
  { chapter: "Claude runs the folder", title: "It completes the routine work.", dur: 6800, selector: '[data-demo="board"]',
    text: "It reads the rules, does each task, writes a completion note, and moves it to Done — exactly like a teammate would.",
    action: (_d, h) => { h.complete("t-105"); setTimeout(() => h.complete("t-203"), 1100); } },
  { chapter: "The guardrail", title: "It refuses what it shouldn't touch.", dur: 6800, selector: '[data-demo="panel"]',
    text: "Publishing a page and changing pricing are off-limits — so it escalates to a human instead, with a recommendation.",
    action: (d) => { d({ type: "space", slug: "northwind" }); d({ type: "select", id: "t-104" }); d({ type: "detailTab", tab: "details" }); } },
  { chapter: "You + your team", title: "You and your partner, on one board.", dur: 6200, selector: '[data-demo="panel"]',
    text: "Relay flagged Alex; Alex pulled in Sam. Two people and an AI, all working the same task.",
    action: (d) => d({ type: "detailTab", tab: "conversation" }) },
  { chapter: "You own it", title: "It's all just files you own.", dur: 6800, selector: '[data-demo="panel"]',
    text: "Every card is a markdown file you and the AI both edit. The board IS the folder — nothing is locked inside an app.",
    action: (d) => { d({ type: "select", id: "t-101" }); d({ type: "fileMode", on: true }); } },
  { chapter: "Who sees what", title: "Different people, different views.", dur: 6500, selector: '[data-demo="role"]',
    text: "An Executive sees everything; a client sees only their own requests. Real, enforced access. Now — here's what's underneath.",
    action: (d) => { d({ type: "fileMode", on: false }); d({ type: "select", id: undefined }); d({ type: "role", role: "exec" }); } },
];

const TERM: { t: string; k: string }[] = [
  { t: "you ▸ here's the Northwind folder. complete the outstanding tasks.", k: "user" },
  { t: "", k: "gap" },
  { t: "Reading the folder…", k: "dim" },
  { t: "  CLAUDE.md → identity.md → rules.md → reference/playbook.md", k: "dim" },
  { t: "  clients/northwind/CONTEXT.md → voice: warm, local · no new claims", k: "dim" },
  { t: "Found 3 outstanding requests in clients/northwind/requests/.", k: "dim" },
  { t: "", k: "gap" },
  { t: "req-1 · “update the homepage headline to same-day quotes”", k: "head" },
  { t: "  sort → 🟢 CLEAR (copy edit · reversible · in playbook)", k: "clear" },
  { t: "  drafting 3 options in Northwind's voice…", k: "dim" },
  { t: "  ✓ wrote deliverables/hero-headline.md", k: "file" },
  { t: "  ✓ completion note: “3 options, #1 recommended. Original preserved.”", k: "note" },
  { t: "  → moved to Completed", k: "done" },
  { t: "", k: "gap" },
  { t: "req-2 · “fix the typo on the About page”", k: "head" },
  { t: "  sort → 🟢 CLEAR · ✓ wrote deliverables/about-typo.md · note added · → Completed", k: "done" },
  { t: "", k: "gap" },
  { t: "req-3 · “push the new pricing page live today”", k: "head" },
  { t: "  sort → 🔴 ESCALATE — production + money (hard triggers)", k: "esc" },
  { t: "  won't publish or touch pricing. Wrote an escalation note + recommendation,", k: "dim" },
  { t: "  assigned @alex. Left in place — not completed.", k: "dim" },
  { t: "", k: "gap" },
  { t: "Done. 2 completed, 1 escalated. Updated clients/northwind/STATE.md.", k: "summary" },
  { t: "The folder now matches reality — a human only has to make one call.", k: "summary" },
];

export function AutoDemo() {
  const { dispatch } = useStore();
  const [phase, setPhase] = useState<Phase>("off");
  const [beat, setBeat] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [edu, setEdu] = useState(0);
  const [term, setTerm] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("relay-demo-seen") === "1"; } catch {}
    if (!seen) { const t = setTimeout(() => setPhase("hook"), 900); return () => clearTimeout(t); }
  }, []);
  const markSeen = () => { try { sessionStorage.setItem("relay-demo-seen", "1"); } catch {} };

  const complete = (id: string) => {
    const seed = SEED_TASKS.find((t) => t.id === id);
    const space = seed && spaceBySlug(seed.spaceSlug);
    if (!seed || !space) return;
    const sort = sortRequest(seed.description);
    const r = bakedCompletion(seed.description, sort, space);
    dispatch({ type: "update", id, patch: { status: "complete", completedBy: "relay", completedAt: "just now", deliverable: r.deliverable, completionNote: r.completionNote, reason: sort.reason } });
  };

  // run beat action + measure spotlight target
  useEffect(() => {
    if (phase !== "play") return;
    const b = BEATS[beat];
    b.action?.(dispatch, { complete });
    let cancelled = false;
    const measure = () => {
      if (cancelled || !b.selector) { setRect(null); return; }
      const el = document.querySelector(b.selector) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const t = setTimeout(measure, 420);
    window.addEventListener("resize", measure);
    return () => { cancelled = true; clearTimeout(t); window.removeEventListener("resize", measure); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, phase]);

  useEffect(() => {
    if (phase !== "play" || paused) return;
    const t = setTimeout(() => (beat >= BEATS.length - 1 ? setPhase("educate") : setBeat((b) => b + 1)), BEATS[beat].dur ?? 6000);
    return () => clearTimeout(t);
  }, [beat, paused, phase]);

  useEffect(() => {
    if (phase !== "educate") return;
    const t = setTimeout(() => (edu >= 2 ? setPhase("terminal") : setEdu((e) => e + 1)), 5200);
    return () => clearTimeout(t);
  }, [phase, edu]);

  useEffect(() => {
    if (phase !== "terminal") { setTerm(0); return; }
    if (term >= TERM.length) { const t = setTimeout(() => setPhase("finale"), 2600); return () => clearTimeout(t); }
    const cur = TERM[term];
    const t = setTimeout(() => setTerm((n) => n + 1), cur.k === "gap" ? 240 : cur.k === "user" ? 1200 : 560);
    return () => clearTimeout(t);
  }, [phase, term]);

  const stop = () => { markSeen(); setPhase("off"); };
  const start = () => { setBeat(0); setEdu(0); setTerm(0); setPaused(false); setPhase("play"); };

  if (phase === "off") {
    return (
      <button onClick={() => setPhase("hook")} className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-ink text-paper rounded-full pl-4 pr-5 py-2.5 shadow-xl hover:opacity-90 animate-lane-in">
        <span className="text-clay">▶</span><span className="text-[13px] font-medium">Watch the guided demo</span>
      </button>
    );
  }

  if (phase === "hook") {
    return (
      <Overlay dark>
        <div className="max-w-2xl text-center">
          <div className="flex justify-center mb-6 text-white"><RelayMark size={46} /></div>
          <h1 className="text-white text-4xl md:text-5xl font-light leading-[1.1] tracking-tight mb-4">You're about to watch a studio <span className="text-clay">run itself.</span></h1>
          <p className="text-white/70 text-lg mb-8">A slow, guided walkthrough — big captions, one step at a time. The cool part isn't the app; it's what's underneath.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={start} className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">▶ Start the walkthrough</button>
            <button onClick={stop} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Already seen it — skip →</button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (phase === "play") {
    const b = BEATS[beat];
    return (
      <>
        <div className="fixed inset-0 z-40" />
        {rect ? (
          <div className="fixed z-40 rounded-lg pointer-events-none transition-all duration-700"
            style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: "0 0 0 9999px rgba(11,11,12,0.6)", border: "2.5px solid var(--clay)" }} />
        ) : <div className="fixed inset-0 z-40 bg-ink/60" />}

        {/* big, consistent caption — the explainer */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[660px] max-w-[92vw]">
          <div className="rounded-2xl bg-paper border border-line shadow-2xl px-6 py-5 animate-lane-in" key={beat}>
            <div className="flex items-center gap-2 mb-2">
              <span className="eyebrow text-clay">{b.chapter}</span>
              <span className="text-[11px] text-muted ml-auto font-mono">Step {beat + 1} of {BEATS.length}</span>
            </div>
            <h2 className="text-[23px] font-medium text-ink leading-tight mb-2 tracking-tight">{b.title}</h2>
            <p className="text-[15px] text-ink-2 leading-relaxed">{b.text}</p>
            <div className="mt-3.5 h-1 rounded-full bg-line overflow-hidden"><div className="h-full bg-clay transition-all duration-500" style={{ width: `${((beat + 1) / BEATS.length) * 100}%` }} /></div>
          </div>
        </div>

        {/* controls */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink/92 text-white rounded-full px-4 py-2 shadow-xl backdrop-blur">
          <button onClick={() => setBeat((x) => Math.max(0, x - 1))} className="text-white/70 hover:text-white text-[13px]" aria-label="Previous">◀ Back</button>
          <button onClick={() => setPaused((p) => !p)} className="text-white text-[12px] px-2" aria-label={paused ? "Play" : "Pause"}>{paused ? "▶ Play" : "❚❚ Pause"}</button>
          <button onClick={() => (beat >= BEATS.length - 1 ? setPhase("educate") : setBeat((x) => x + 1))} className="text-white/70 hover:text-white text-[13px]" aria-label="Next">Next ▶</button>
          <span className="w-px h-4 bg-white/20" />
          <button onClick={() => setPhase("educate")} className="text-[11px] text-white/60 hover:text-white">Skip to “how”</button>
          <button onClick={stop} className="text-[11px] text-white/60 hover:text-white">✕ Exit</button>
        </div>
      </>
    );
  }

  if (phase === "educate") {
    const cards = [
      { k: "The turn", t: "Everything you saw is a folder of markdown.", b: "One folder per client. Point Claude at a client's folder and it knows that client's work, rules, and voice — no database, no setup. The files are the source of truth." },
      { k: "Three layers", t: "Interpretable Context Methodology", b: "**Map** (CLAUDE.md) routes the agent · **Rooms** (CONTEXT.md) load per stage · **Skills** load only when a task needs one. The folder behaves like a deep specialist without loading everything." },
      { k: "The engine", t: "rules.md literally runs this.", b: "The Lane Protocol — clear / hold / escalate — is the same logic whether a human or Claude works the folder. The methodology isn't documentation *about* the product. It **is** the product." },
    ];
    const c = cards[edu];
    return (
      <Overlay>
        <div className="max-w-xl">
          <div className="eyebrow text-clay mb-3">Under the hood · {edu + 1}/3</div>
          <h2 className="text-3xl font-light tracking-tight text-ink mb-3">{c.t}</h2>
          <p className="text-ink-2 text-[15px] leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: c.b.replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink">$1</strong>') }} />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">{cards.map((_, i) => <span key={i} className="h-1 rounded-full" style={{ width: i === edu ? 18 : 6, background: i === edu ? "var(--clay)" : "var(--line)" }} />)}</div>
            <button onClick={() => (edu >= 2 ? setPhase("terminal") : setEdu(edu + 1))} className="ml-auto bg-ink text-paper px-4 py-2 rounded-md text-[13px]">{edu >= 2 ? "Now run it in Claude →" : "Next →"}</button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (phase === "terminal") {
    const color = (k: string) => k === "user" ? "text-white" : k === "clear" ? "text-[#4ADE80]" : k === "esc" ? "text-[#FBBF24]" : k === "file" || k === "done" ? "text-[#7CC4FF]" : k === "note" ? "text-[#C9A8FF]" : k === "head" ? "text-white font-medium" : k === "summary" ? "text-white" : "text-[#8E8E93]";
    return (
      <Overlay>
        <div className="max-w-2xl w-full">
          <div className="eyebrow text-clay mb-2">No app required</div>
          <h2 className="text-2xl font-light tracking-tight text-ink mb-1">Every client is a folder. Drop it into Claude.</h2>
          <p className="text-ink-2 text-[13.5px] mb-4">Point Claude at the client's folder and ask it to clear the queue. It reads the rules and does exactly what that client needs — here's the real session, step by step.</p>
          <div className="rounded-xl bg-[#0B0B0C] border border-[#26262A] p-4 font-mono text-[12px] leading-relaxed h-[340px] overflow-hidden">
            <div className="text-[#8E8E93] mb-2 pb-2 border-b border-[#26262A]">Claude · clients/northwind/ folder uploaded</div>
            {TERM.slice(0, term).map((l, i) => l.k === "gap" ? <div key={i} className="h-2" /> : <div key={i} className={`animate-lane-in ${color(l.k)}`}>{l.t}</div>)}
            {term < TERM.length && <span className="inline-block w-2 h-3.5 bg-clay animate-blink align-middle" />}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setTerm(TERM.length)} className="text-[12px] text-muted hover:text-ink">Skip ▸</button>
            <button onClick={() => setPhase("finale")} className="bg-ink text-paper px-4 py-2 rounded-md text-[13px]">The vision →</button>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay dark>
      <div className="max-w-2xl text-center">
        <div className="flex justify-center mb-6 text-white"><RelayMark size={42} /></div>
        <h2 className="text-white text-3xl md:text-4xl font-light leading-tight tracking-tight mb-4">This is a slice of the real system we run our studio on.</h2>
        <p className="text-white/70 text-[16px] leading-relaxed mb-8">The methodology scales — to teams, to any folder-based work. What you just used is the tip of the iceberg. The folder is the product; the product is yours.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={stop} className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">Explore it yourself →</button>
          <button onClick={start} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Replay</button>
        </div>
        <div className="text-white/40 text-[11px] mt-8">Relay™ · © 2026 · a demo of what's possible — not the production product.</div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 animate-lane-in ${dark ? "bg-[#0B0B0C]" : "bg-paper/97 backdrop-blur"}`}>{children}</div>;
}
