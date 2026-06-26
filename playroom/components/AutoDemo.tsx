"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { sortRequest, bakedCompletion } from "@/lib/lane";
import { spaceBySlug, SEED_TASKS } from "@/lib/studio";
import { nextTaskId } from "@/lib/id";
import { RelayMark } from "./RelayMark";
import type { Task } from "@/lib/types";

type Phase = "off" | "hook" | "play" | "educate" | "terminal" | "finale";
type Dispatch = ReturnType<typeof useStore>["dispatch"];
interface Rect { top: number; left: number; width: number; height: number }

interface Beat {
  chapter: string;
  text: string;
  selector?: string;
  action?: (d: Dispatch, helpers: { complete: (id: string) => void }) => void;
  dur?: number;
}

const BEATS: Beat[] = [
  { chapter: "The studio", selector: '[data-demo="rail"]', dur: 4600,
    text: "Meet the studio board. On the left are your spaces — two clients, and a founders-only Executive space.",
    action: (d) => { d({ type: "role", role: "exec" }); d({ type: "space", slug: "all" }); d({ type: "view", view: "board" }); d({ type: "select", id: undefined }); } },
  { chapter: "The client", selector: '[data-demo="client-input"]', dur: 4600,
    text: "A client never logs into a project tool. They just ask — in plain language — right here.",
    action: (d) => d({ type: "role", role: "client" }) },
  { chapter: "The client", selector: '[data-demo="client-input"]', dur: 4400,
    text: "They send a request and watch its status. That's all a client can do — ask. Nothing internal, ever.",
    action: (d) => d({ type: "add", task: { id: nextTaskId(), spaceSlug: "northwind", title: "Add a 'financing available' note to the pricing page", description: "add a short 'financing available' note on the pricing page", priority: "p2", status: "outstanding", assignee: null, labels: ["copy"], checklist: [], origin: "client", filedBy: "client (Dana)", comments: [] } }) },
  { chapter: "The team + the AI", selector: '[data-demo="presence"]', dur: 4400,
    text: "Back on the operator side — Alex, Sam, and Relay (the AI) all work the same board.",
    action: (d) => { d({ type: "role", role: "exec" }); d({ type: "view", view: "board" }); d({ type: "space", slug: "all" }); d({ type: "select", id: undefined }); } },
  { chapter: "Run it", selector: '[data-demo="run-tasks"]', dur: 3800,
    text: "Now I tell Relay to run the tasks — one click." },
  { chapter: "Run it", selector: '[data-demo="board"]', dur: 5200,
    text: "It clears the routine work itself: does it, writes a completion note, and moves each card to Done — exactly what a person would do.",
    action: (_d, h) => { h.complete("t-105"); setTimeout(() => h.complete("t-203"), 900); } },
  { chapter: "The guardrail", selector: '[data-demo="panel"]', dur: 5400,
    text: "But it refused to publish the pricing page — production + money. It escalated instead, with a recommendation. That discipline is why you can leave it running.",
    action: (d) => { d({ type: "space", slug: "northwind" }); d({ type: "select", id: "t-104" }); d({ type: "detailTab", tab: "details" }); } },
  { chapter: "The handoff", selector: '[data-demo="panel"]', dur: 5200,
    text: "Here's how the team works: Relay flagged Alex, Alex pulled in Sam. Three teammates — two human, one AI — on one task.",
    action: (d) => d({ type: "detailTab", tab: "conversation" }) },
  { chapter: "The truth", selector: '[data-demo="panel"]', dur: 5400,
    text: "And everything you've seen is a markdown file Relay and the team both edit. The board IS the folder — you own every file.",
    action: (d) => { d({ type: "select", id: "t-101" }); d({ type: "fileMode", on: true }); } },
  { chapter: "Access", selector: '[data-demo="role"]', dur: 3800,
    text: "Access is real, not cosmetic. Use this to switch who's looking.",
    action: (d) => { d({ type: "fileMode", on: false }); d({ type: "select", id: undefined }); } },
  { chapter: "Access", selector: '[data-demo="rail"]', dur: 4200,
    text: "A Member sees only client spaces — the Executive space disappears entirely.",
    action: (d) => d({ type: "role", role: "member" }) },
  { chapter: "Access", selector: '[data-demo="role"]', dur: 4200,
    text: "An Executive sees everything. Same product, three tiers. Now — here's what's actually underneath.",
    action: (d) => d({ type: "role", role: "exec" }) },
];

const TERM: { t: string; k: string }[] = [
  { t: "you ▸ complete the outstanding tasks for Northwind", k: "user" },
  { t: "", k: "gap" },
  { t: "Reading the folder…", k: "dim" },
  { t: "  CLAUDE.md → identity.md → rules.md → reference/playbook.md", k: "dim" },
  { t: "Found 3 outstanding requests in clients/northwind/requests/.", k: "dim" },
  { t: "", k: "gap" },
  { t: "req-1 · “update the homepage headline to same-day quotes”", k: "head" },
  { t: "  sort → 🟢 CLEAR (copy edit · reversible · in playbook)", k: "clear" },
  { t: "  loading clients/northwind/CONTEXT.md — voice: warm, local, no new claims", k: "dim" },
  { t: "  drafting 3 options in Northwind's voice…", k: "dim" },
  { t: "  ✓ wrote deliverables/hero-headline.md", k: "file" },
  { t: "  ✓ completion note: “3 options, #1 recommended. Original preserved.”", k: "note" },
  { t: "  → moved to Completed", k: "done" },
  { t: "", k: "gap" },
  { t: "req-2 · “fix the typo on the About page”", k: "head" },
  { t: "  sort → 🟢 CLEAR (factual correction)", k: "clear" },
  { t: "  ✓ wrote deliverables/about-typo.md · note added · → Completed", k: "done" },
  { t: "", k: "gap" },
  { t: "req-3 · “push the new pricing page live today”", k: "head" },
  { t: "  sort → 🔴 ESCALATE — production + money (hard triggers)", k: "esc" },
  { t: "  I won't publish or touch pricing. Wrote an escalation note with a recommendation,", k: "dim" },
  { t: "  assigned to @alex. Left in place — not completed.", k: "dim" },
  { t: "", k: "gap" },
  { t: "Done. 2 completed, 1 escalated. Updated clients/northwind/STATE.md.", k: "summary" },
  { t: "The folder now matches reality — and a human only has to make one call.", k: "summary" },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AutoDemo() {
  const { dispatch } = useStore();
  const [phase, setPhase] = useState<Phase>("off");
  const [beat, setBeat] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [edu, setEdu] = useState(0);
  const [term, setTerm] = useState(0);

  // auto-run on first visit
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("relay-demo-seen") === "1"; } catch {}
    if (!seen) { const t = setTimeout(() => setPhase("hook"), 900); return () => clearTimeout(t); }
  }, []);
  const markSeen = () => { try { sessionStorage.setItem("relay-demo-seen", "1"); } catch {} };

  const complete = (id: string) => {
    const seed = SEED_TASKS.find((t) => t.id === id);
    if (!seed) return;
    const space = spaceBySlug(seed.spaceSlug);
    if (!space) return;
    const sort = sortRequest(seed.description);
    const r = bakedCompletion(seed.description, sort, space);
    dispatch({ type: "update", id, patch: { status: "complete", completedBy: "relay", completedAt: "just now", deliverable: r.deliverable, completionNote: r.completionNote, reason: sort.reason } });
  };

  // run beat action + measure target
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
    const t = setTimeout(measure, 380);
    window.addEventListener("resize", measure);
    return () => { cancelled = true; clearTimeout(t); window.removeEventListener("resize", measure); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, phase]);

  // auto-advance
  useEffect(() => {
    if (phase !== "play" || paused) return;
    const t = setTimeout(() => {
      if (beat >= BEATS.length - 1) setPhase("educate");
      else setBeat((b) => b + 1);
    }, BEATS[beat].dur ?? 4400);
    return () => clearTimeout(t);
  }, [beat, paused, phase]);

  // educate auto-advance
  useEffect(() => {
    if (phase !== "educate") return;
    const t = setTimeout(() => (edu >= 2 ? setPhase("terminal") : setEdu((e) => e + 1)), 4600);
    return () => clearTimeout(t);
  }, [phase, edu]);

  // terminal stream
  useEffect(() => {
    if (phase !== "terminal") { setTerm(0); return; }
    if (term >= TERM.length) { const t = setTimeout(() => setPhase("finale"), 2400); return () => clearTimeout(t); }
    const cur = TERM[term];
    const t = setTimeout(() => setTerm((n) => n + 1), cur.k === "gap" ? 220 : cur.k === "user" ? 1100 : 520);
    return () => clearTimeout(t);
  }, [phase, term]);

  const stop = () => { markSeen(); setPhase("off"); };
  const start = () => { setBeat(0); setEdu(0); setTerm(0); setPaused(false); setPhase("play"); };
  const skipToEducate = () => { setRect(null); setPhase("educate"); };

  // ── OFF: floating launcher ──
  if (phase === "off") {
    return (
      <button onClick={() => setPhase("hook")} className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-ink text-paper rounded-full pl-4 pr-5 py-2.5 shadow-xl hover:opacity-90 animate-lane-in">
        <span className="text-clay">▶</span><span className="text-[13px] font-medium">Watch the guided demo</span>
      </button>
    );
  }

  // ── HOOK ──
  if (phase === "hook") {
    return (
      <Overlay dark>
        <div className="max-w-2xl text-center">
          <div className="flex justify-center mb-6 text-white"><RelayMark size={46} /></div>
          <h1 className="text-white text-4xl md:text-5xl font-light leading-[1.1] tracking-tight mb-4">You're about to watch a studio <span className="text-clay">run itself.</span></h1>
          <p className="text-white/70 text-lg mb-8">A 90-second guided walkthrough — it points at everything as it goes. The cool part isn't the app; it's what's underneath.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={start} className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">▶ Watch the walkthrough</button>
            <button onClick={stop} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Already seen it — skip →</button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── PLAY: spotlight + callout + controls ──
  if (phase === "play") {
    const b = BEATS[beat];
    const place = rect ? (rect.top < window.innerHeight * 0.5 ? "below" : "above") : "center";
    const calloutTop = rect ? (place === "below" ? rect.top + rect.height + 14 : rect.top - 14) : 0;
    const calloutLeft = rect ? Math.min(Math.max(rect.left + rect.width / 2, 200), window.innerWidth - 200) : 0;
    return (
      <>
        {/* click catcher so the app isn't disturbed mid-demo */}
        <div className="fixed inset-0 z-40" />
        {/* spotlight cutout (dims everything but the target) */}
        {rect && (
          <div className="fixed z-40 rounded-lg pointer-events-none transition-all duration-500"
            style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: "0 0 0 9999px rgba(11,11,12,0.55)", border: "2px solid var(--clay)" }} />
        )}
        {!rect && <div className="fixed inset-0 z-40 bg-ink/55" />}
        {/* callout */}
        <div className="fixed z-50 w-[360px] max-w-[88vw] -translate-x-1/2 transition-all duration-500"
          style={{ top: place === "center" ? "42%" : calloutTop, left: place === "center" ? "50%" : calloutLeft, transform: place === "above" ? "translate(-50%,-100%)" : "translate(-50%,0)" }}>
          <div className="rounded-xl bg-paper border border-line shadow-xl p-4">
            <div className="eyebrow text-clay mb-1.5">{b.chapter}</div>
            <p className="text-[14px] text-ink leading-snug">{b.text}</p>
          </div>
        </div>
        {/* controls */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink/92 text-white rounded-full px-4 py-2 shadow-xl backdrop-blur">
          <button onClick={() => setBeat((x) => Math.max(0, x - 1))} className="text-white/70 hover:text-white text-[13px]" aria-label="Previous">◀</button>
          <button onClick={() => setPaused((p) => !p)} className="text-white text-[13px] w-5" aria-label={paused ? "Play" : "Pause"}>{paused ? "▶" : "❚❚"}</button>
          <button onClick={() => (beat >= BEATS.length - 1 ? setPhase("educate") : setBeat((x) => x + 1))} className="text-white/70 hover:text-white text-[13px]" aria-label="Next">▶</button>
          <span className="text-[11px] text-white/60 w-24 text-center">{beat + 1} / {BEATS.length} · {b.chapter}</span>
          <button onClick={skipToEducate} className="text-[11px] text-white/60 hover:text-white">Skip ▸</button>
          <button onClick={stop} className="text-[11px] text-white/60 hover:text-white">✕</button>
        </div>
      </>
    );
  }

  // ── EDUCATE ──
  if (phase === "educate") {
    const cards = [
      { k: "The turn", t: "Everything you just saw is a folder of markdown.", b: "No database is the source of truth — the files are. The UI is a window; the AI is a worker; the folder is the business, and it survives even if the app dies." },
      { k: "Three layers", t: "Interpretable Context Methodology", b: "**Map** (CLAUDE.md) routes the agent · **Rooms** (CONTEXT.md) load per stage · **Skills** load only when a task needs one. It never loads everything — that's how a folder behaves like a deep specialist." },
      { k: "The engine", t: "rules.md literally runs this.", b: "The Lane Protocol — clear / hold / escalate — is the same logic whether a human or the AI works the board. The methodology isn't documentation *about* the product. It **is** the product." },
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

  // ── TERMINAL: deep Claude session ──
  if (phase === "terminal") {
    const color = (k: string) => k === "user" ? "text-white" : k === "clear" ? "text-[#4ADE80]" : k === "esc" ? "text-[#FBBF24]" : k === "file" || k === "done" ? "text-[#7CC4FF]" : k === "note" ? "text-[#C9A8FF]" : k === "head" ? "text-white font-medium" : k === "summary" ? "text-white" : "text-[#8E8E93]";
    return (
      <Overlay>
        <div className="max-w-2xl w-full">
          <div className="eyebrow text-clay mb-2">No app required</div>
          <h2 className="text-2xl font-light tracking-tight text-ink mb-1">Drop the folder into Claude. It clears the queue.</h2>
          <p className="text-ink-2 text-[13.5px] mb-4">Same rules, zero UI — upload the Relay folder and ask Claude to complete the outstanding tasks. Watch how it actually works.</p>
          <div className="rounded-xl bg-[#0B0B0C] border border-[#26262A] p-4 font-mono text-[12px] leading-relaxed h-[340px] overflow-hidden">
            <div className="text-[#8E8E93] mb-2 pb-2 border-b border-[#26262A]">Claude · relay/ folder uploaded · studio/clients/northwind</div>
            {TERM.slice(0, term).map((l, i) => (
              l.k === "gap" ? <div key={i} className="h-2" /> :
              <div key={i} className={`animate-lane-in ${color(l.k)}`}>{l.t}</div>
            ))}
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

  // ── FINALE ──
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
