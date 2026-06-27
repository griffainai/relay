"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { sortRequest, bakedCompletion } from "@/lib/lane";
import { spaceBySlug, SEED_TASKS } from "@/lib/studio";
import { RelayMark } from "./RelayMark";

type Phase = "off" | "hook" | "play" | "educate" | "terminal" | "finale";
type Dispatch = ReturnType<typeof useStore>["dispatch"];
interface Rect { top: number; left: number; width: number; height: number }

interface Beat {
  chapter: string;
  title: string;
  text: string;
  selector?: string;
  action?: (d: Dispatch, h: { done: (id: string) => void }) => void;
  dur?: number;
}

const BEATS: Beat[] = [
  { chapter: "Clients are folders", title: "Every client is a folder.", dur: 5800, selector: '[data-demo="rail"]',
    text: "Northwind and Acme each have their own folder — all of their work, files, voice, and rules live inside it.",
    action: (d) => { d({ type: "role", role: "exec" }); d({ type: "space", slug: "all" }); d({ type: "view", view: "board" }); d({ type: "select", id: undefined }); d({ type: "update", id: "t-510", patch: { status: "outstanding", completionNote: undefined, completedBy: undefined, completedAt: undefined, deliverable: undefined } }); } },

  // ── the many ways work shows up ──
  { chapter: "How work shows up", title: "A client files their own request.", dur: 6200, selector: '[data-demo="client-input"]',
    text: "First way: the client asks, in plain language — no login, no tool. They only ever see their own requests.",
    action: (d) => d({ type: "role", role: "client" }) },
  { chapter: "How work shows up", title: "A co-founder assigns you a task.", dur: 6200, selector: '[data-demo="panel"]',
    text: "Second way: your co-founder Sam files one and assigns it to you — “finalize the hero copy.”",
    action: (d) => { d({ type: "role", role: "exec" }); d({ type: "space", slug: "northwind" }); d({ type: "select", id: "t-510" }); d({ type: "detailTab", tab: "details" }); } },
  { chapter: "How work shows up", title: "…or files one for himself.", dur: 5800, selector: '[data-demo="panel"]',
    text: "Third way: a co-founder logs a task for himself — like staging the Acme deploy.",
    action: (d) => { d({ type: "space", slug: "acme-studio" }); d({ type: "select", id: "t-511" }); } },
  { chapter: "How work shows up", title: "…or you jot a memo for yourself.", dur: 5800, selector: '[data-demo="panel"]',
    text: "Fourth way: tasks aren't only client work — drop a memo for yourself too. Same board for clients, your partner, and you.",
    action: (d) => { d({ type: "space", slug: "northwind" }); d({ type: "select", id: "t-512" }); } },

  // ── do the one Sam sent you, by hand ──
  { chapter: "You do it", title: "Copy the prompt.", dur: 6400, selector: '[data-demo="panel"]',
    text: "Let's do the one Sam sent you. Relay assembles the exact instructions from the folder — the request, the client's voice, the do-not-cross lines. One click to copy.",
    action: (d) => { d({ type: "select", id: "t-510" }); d({ type: "detailTab", tab: "details" }); } },
  { chapter: "You do it", title: "Run it in Claude.", dur: 6600, selector: '[data-demo="panel"]',
    text: "Paste it into Claude. Because the client's folder holds the actual website files, Claude makes the real edit — not a suggestion." },
  { chapter: "You do it", title: "Paste the note. Done.", dur: 6200, selector: '[data-demo="panel"]',
    text: "Drop Claude's result back on the task and mark it complete — it moves to Done. That's the whole loop, by hand.",
    action: (_d, h) => h.done("t-510") },

  { chapter: "The guardrail", title: "Some things you escalate — never auto-do.", dur: 6400, selector: '[data-demo="panel"]',
    text: "Publishing a page or changing pricing is off-limits. Relay flags those for a human, with a recommendation. It never crosses that line.",
    action: (d) => { d({ type: "select", id: "t-104" }); d({ type: "detailTab", tab: "details" }); } },
  { chapter: "You + your team", title: "You and your partner, on one board.", dur: 6000, selector: '[data-demo="panel"]',
    text: "Relay flagged Alex; Alex pulled in Sam. The whole handoff lives on the task — two people and the AI, in one place.",
    action: (d) => d({ type: "detailTab", tab: "conversation" }) },
  { chapter: "You own it", title: "It's all just files you own.", dur: 6000, selector: '[data-demo="panel"]',
    text: "Every card is a markdown file. The board IS the folder — nothing is trapped inside an app.",
    action: (d) => { d({ type: "select", id: "t-101" }); d({ type: "fileMode", on: true }); } },
  { chapter: "Who sees what", title: "Different people, different views.", dur: 6200, selector: '[data-demo="role"]',
    text: "Executive sees everything; a client sees only their own requests. Real, enforced access. Now — the fully autonomous way.",
    action: (d) => { d({ type: "fileMode", on: false }); d({ type: "select", id: undefined }); d({ type: "role", role: "exec" }); } },
];

const TERM: { t: string; k: string }[] = [
  { t: "you ▸ here's the whole Northwind folder. run all the outstanding tasks.", k: "user" },
  { t: "", k: "gap" },
  { t: "Reading the folder…", k: "dim" },
  { t: "  CLAUDE.md → identity.md → rules.md → reference/playbook.md", k: "dim" },
  { t: "  clients/northwind/ → site/ (the live website files) · CONTEXT.md (voice) · requests/ (3 open)", k: "dim" },
  { t: "The folder has everything I need — the site, the rules, the voice. Running all 3.", k: "dim" },
  { t: "", k: "gap" },
  { t: "req-1 · “update the homepage headline to same-day quotes”", k: "head" },
  { t: "  🟢 CLEAR · editing site/index.html → <h1>…</h1>", k: "clear" },
  { t: "  ✓ changed the headline in the site files (3 options, #1 applied)", k: "file" },
  { t: "  ✓ note: “Headline updated in voice. Original preserved.” → Completed", k: "done" },
  { t: "", k: "gap" },
  { t: "req-2 · “fix the typo on the About page”", k: "head" },
  { t: "  🟢 CLEAR · editing site/about.html → “photograhy” → “photography”", k: "clear" },
  { t: "  ✓ fixed in the site files · note added · → Completed", k: "done" },
  { t: "", k: "gap" },
  { t: "req-3 · “push the new pricing page live today”", k: "head" },
  { t: "  🔴 ESCALATE — production + money. I won't publish or touch pricing.", k: "esc" },
  { t: "  Wrote an escalation note + recommendation, assigned @alex. Left untouched.", k: "dim" },
  { t: "", k: "gap" },
  { t: "Done. 2 edits made in the site files, 1 escalated. Updated STATE.md.", k: "summary" },
  { t: "Because the whole folder was here, I didn't ask a single question — I just did the work.", k: "summary" },
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

  // simulate "you pasted Claude's completion note back" — a manual, human-marked completion
  const done = (id: string) => {
    const seed = SEED_TASKS.find((t) => t.id === id);
    const space = seed && spaceBySlug(seed.spaceSlug);
    const r = seed && space ? bakedCompletion(seed.description, sortRequest(seed.description), space) : {};
    dispatch({ type: "update", id, patch: { status: "complete", completedBy: "jay", completedAt: "just now", deliverable: (r as any).deliverable, completionNote: "Ran it in Claude → pasted the note. Hero copy finalized (3 options, #1 recommended). Reversible." } });
  };

  useEffect(() => {
    if (phase !== "play") return;
    const b = BEATS[beat];
    b.action?.(dispatch, { done });
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
    const t = setTimeout(() => setTerm((n) => n + 1), cur.k === "gap" ? 240 : cur.k === "user" ? 1300 : 600);
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
          <p className="text-white/70 text-lg mb-8">A slow, guided walkthrough — big captions, one step at a time. First how a teammate works it by hand, then how Claude runs the whole folder.</p>
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
      { k: "The turn", t: "Everything you saw is a folder of markdown.", b: "One folder per client — including the website files. Point Claude at a client's folder and it knows that client's work, rules, and voice. The files are the source of truth." },
      { k: "Three layers", t: "Interpretable Context Methodology", b: "**Map** (CLAUDE.md) routes the agent · **Rooms** (CONTEXT.md) load per stage · **Skills** load only when a task needs one. The folder behaves like a deep specialist without loading everything." },
      { k: "The engine", t: "rules.md literally runs this.", b: "The Lane Protocol — clear / hold / escalate — is the same logic whether a human works a task by hand or Claude runs the whole folder. The methodology isn't documentation *about* the product. It **is** the product." },
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
            <button onClick={() => (edu >= 2 ? setPhase("terminal") : setEdu(edu + 1))} className="ml-auto bg-ink text-paper px-4 py-2 rounded-md text-[13px]">{edu >= 2 ? "Now the autonomous way →" : "Next →"}</button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (phase === "terminal") {
    const color = (k: string) => k === "user" ? "text-white" : k === "clear" ? "text-[#4ADE80]" : k === "esc" ? "text-[#FBBF24]" : k === "file" || k === "done" ? "text-[#7CC4FF]" : k === "head" ? "text-white font-medium" : k === "summary" ? "text-white" : "text-[#8E8E93]";
    return (
      <Overlay>
        <div className="max-w-2xl w-full">
          <div className="eyebrow text-clay mb-2">The autonomous way · no app, no clicking</div>
          <h2 className="text-2xl font-light tracking-tight text-ink mb-1">Drop the whole client folder in the cloud.</h2>
          <p className="text-ink-2 text-[13.5px] mb-4">Earlier you did one task by hand. Here, you hand Claude the entire folder — website files and all — and tell it to run everything. It has all it needs, so it just does the work, step by step.</p>
          <div className="rounded-xl bg-[#0B0B0C] border border-[#26262A] p-4 font-mono text-[12px] leading-relaxed h-[340px] overflow-hidden">
            <div className="text-[#8E8E93] mb-2 pb-2 border-b border-[#26262A]">Claude · clients/northwind/ folder uploaded (site files + rules)</div>
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
        <p className="text-white/70 text-[16px] leading-relaxed mb-8">The methodology scales — to teams, to any folder-based work. The full system adds a calendar that drives billing, a costs board, decisions, and org admin. We kept this demo deliberately specific so it stays clear and didn't go overboard — what you used is the tip of the iceberg. The folder is the product; the product is yours.</p>
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
