"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { sortRequest, bakedCompletion } from "@/lib/lane";
import { SEED_TASKS } from "@/lib/studio";
import { spaceBySlug } from "@/lib/datasets";
import { SCHOOL } from "@/lib/promo";
import { RelayMark } from "./RelayMark";

type Phase = "off" | "pitch" | "play" | "educate" | "terminal" | "finale";
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

  // ── the client's own account (Discord-style login) ──
  { chapter: "The client's account", title: "Clients log into their own account.", dur: 6400, selector: '[data-demo="portal"]',
    text: "Every client has a login — they land in their own portal, like a private workspace. Here's their whole engagement, start to finish.",
    action: (d) => { d({ type: "role", role: "client" }); d({ type: "clientTab", tab: "overview" }); } },
  { chapter: "The client's account", title: "The goal we agreed on.", dur: 6200, selector: '[data-demo="portal"]',
    text: "Goals tab: the problem, the vision, the goal, and the guardrails — plus live targets. They see the why, not just tickets.",
    action: (d) => d({ type: "clientTab", tab: "goals" }) },
  { chapter: "The client's account", title: "They review and approve the work.", dur: 6200, selector: '[data-demo="portal"]',
    text: "Deliverables tab: each piece of work, with Approve or Request-changes. Approving verifies that step of the build.",
    action: (d) => d({ type: "clientTab", tab: "deliverables" }) },
  { chapter: "The client's account", title: "Files, meetings, and billing — all theirs.", dur: 6400, selector: '[data-demo="portal"]',
    text: "They own their files, book a Google Meet right here, and see their plan + invoices. The whole relationship in one place.",
    action: (d) => d({ type: "clientTab", tab: "meetings" }) },
  { chapter: "The client's account", title: "They see their board — and reply on requests.", dur: 6400, selector: '[data-demo="portal"]',
    text: "Their own board: they open any request, see its status, and reply to the studio right there — within their retainer scope. That's the first of several ways work shows up.",
    action: (d) => d({ type: "clientTab", tab: "board" }) },
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
  // ── talk to each other (everyone has a login) ──
  { chapter: "Talk to each other", title: "Everyone has a login — so you message each other.", dur: 6400, selector: '[data-demo="main"]',
    text: "Because every operator and client has their own account, the studio chats right here — channels and DMs, like Discord. It's all one place: the work and the talk.",
    action: (d) => { d({ type: "select", id: undefined }); d({ type: "view", view: "messages" }); d({ type: "channel", id: "studio" }); } },
  { chapter: "Talk to each other", title: "There's even a live lounge.", dur: 6000, selector: '[data-demo="main"]',
    text: "Everyone exploring the demo right now drops into the lounge and can chat. Real accounts are what make all of this multiplayer.",
    action: (d) => d({ type: "channel", id: "lounge" }) },

  // ── the rest of the workspace (explained) ──
  { chapter: "The cockpit", title: "What needs you — across every client.", dur: 6000, selector: '[data-demo="main"]',
    text: "The cockpit cuts through it all: the single most important thing to do next, plus what's escalated and on hold — across every space.",
    action: (d) => d({ type: "view", view: "cockpit" }) },
  { chapter: "Analytics", title: "The numbers, and who's closing the work.", dur: 6000, selector: '[data-demo="main"]',
    text: "Throughput, completion rate, tasks by space — and a breakdown of who's closing work, including how much Relay clears on its own.",
    action: (d) => d({ type: "view", view: "analytics" }) },
  { chapter: "Activity", title: "Every move — fully audited.", dur: 5800, selector: '[data-demo="main"]',
    text: "A complete trail of what you, your partner, and the AI each did and when — filterable, searchable. The trail is the trust.",
    action: (d) => d({ type: "view", view: "activity" }) },
  { chapter: "The Brain", title: "How it actually thinks.", dur: 6200, selector: '[data-demo="main"]',
    text: "This is the methodology: a Map (CLAUDE.md) routes the agent, Rooms load per stage of work, Skills load per task. The folder behaves like a deep specialist — that's the engine under everything you've seen.",
    action: (d) => d({ type: "view", view: "brain" }) },

  { chapter: "You own it", title: "It's all just files you own.", dur: 5600, selector: '[data-demo="panel"]',
    text: "Back to a task: every card is a markdown file. Flip “File ·md” — that's the actual file.",
    action: (d) => { d({ type: "view", view: "board" }); d({ type: "space", slug: "northwind" }); d({ type: "select", id: "t-101" }); d({ type: "fileMode", on: true }); } },
  { chapter: "Everything is a folder", title: "This is the whole point.", dur: 7600, selector: '[data-demo="main"]',
    text: "Not just tasks. EVERY piece of this — requests, deliverables, goals, messages, invoices, meetings, even the AI's own rules — is a markdown file in a folder you own. No database is the source of truth; the folder is. Here's the entire product, as files.",
    action: (d) => { d({ type: "fileMode", on: false }); d({ type: "select", id: undefined }); d({ type: "view", view: "folder" }); } },
  { chapter: "Who sees what", title: "Different people, different views.", dur: 6200, selector: '[data-demo="role"]',
    text: "Executive sees everything; a member sees client spaces; a client sees only their own requests. Real, enforced access — every account scoped server-side.",
    action: (d) => { d({ type: "fileMode", on: false }); d({ type: "select", id: undefined }); d({ type: "role", role: "exec" }); } },
  { chapter: "You run access", title: "Invite teammates — grant exactly what they see.", dur: 6600, selector: '[data-demo="main"]',
    text: "You manage it yourself: invite someone by email, set their tier, and check off the exact spaces they get. That's how a client only ever sees their own folder, and a member never sees Executive.",
    action: (d) => d({ type: "view", view: "admin" }) },

  // ── what's in the full system (explained, not shown) ──
  { chapter: "In the full system", title: "Logins, and many businesses — separated.", dur: 6600, selector: '[data-demo="locked"]',
    text: "Every client and teammate logs in (that's how messaging works), and you can run multiple businesses from one account — each its own clients, team, and billing, fully separated. Nothing ever mixes.",
    action: (d) => { d({ type: "view", view: "board" }); d({ type: "select", id: undefined }); } },
  { chapter: "In the full system", title: "Calendar → billing, costs, decisions, admin.", dur: 6800, selector: '[data-demo="locked"]',
    text: "A calendar where scheduled time drives billing and the admin's cost view; a costs board; a decision log the AI reads as context; org & access admin. We kept this demo deliberately specific and didn't go overboard — tap any 🔒 item to read exactly what each is and how it works.",
    action: (d) => d({ type: "view", view: "board" }) },
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

// the 60-second Grand-Slam pitch (backstory + value equation, in the studio's voice)
const PITCH: { big: string; sub: string }[] = [
  { big: "Two people. Eight companies. One board.", sub: "This is the system they actually run it on — not a mockup." },
  { big: "They were drowning.", sub: "Work scattered across Slack, docs, and eight separate folders. No way to see what was dying — or what needed them next." },
  { big: "They tried the enterprise-platform trap.", sub: "Role matrices, dashboards, the works. Scrapped it. The real problem was never features — it was operating discipline." },
  { big: "So they built the opposite — a folder.", sub: "Every task, message, decision, and deliverable is a markdown file they own. The board is the work. The files are the truth. If the app dies, the work lives." },
  { big: "And the work doesn't just get tracked. It gets done.", sub: "Clients ask in plain language. The routine clears itself. You only touch the 20% that needs a human." },
  { big: "It isn't a concept.", sub: "It runs a real studio — real clients, real revenue. Point Claude at the folder and it works your queue. Files you own, no lock-in." },
  { big: "Built for themselves first.", sub: "If it's sharp enough for two people running eight companies, it's sharp enough for your team." },
  { big: "This is Relay.", sub: "The work finishes itself." },
];

export function AutoDemo() {
  const { state, dispatch } = useStore();
  const [phase, setPhase] = useState<Phase>("off");
  const [beat, setBeat] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [edu, setEdu] = useState(0);
  const [term, setTerm] = useState(0);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("relay-demo-seen") === "1"; } catch {}
    if (!seen) { const t = setTimeout(() => setPhase("pitch"), 900); return () => clearTimeout(t); }
  }, []);

  // pitch auto-advance → flows into the walkthrough
  useEffect(() => {
    if (phase !== "pitch") return;
    const last = slide >= PITCH.length - 1;
    const t = setTimeout(() => {
      if (last) { setBeat(0); setEdu(0); setTerm(0); setPaused(false); setPhase("play"); }
      else setSlide((s) => s + 1);
    }, last ? 7000 : 5200);
    return () => clearTimeout(t);
  }, [phase, slide]);
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
    const t = setTimeout(() => (edu >= 3 ? setPhase("terminal") : setEdu((e) => e + 1)), 5200);
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
  const openPitch = () => { setSlide(0); setPhase("pitch"); };

  if (phase === "off") {
    if (state.examples) return null; // the examples experience owns the screen
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 animate-lane-in">
        <button onClick={openPitch} className="flex items-center gap-2 bg-ink text-paper rounded-full pl-4 pr-5 py-2.5 shadow-xl hover:opacity-90">
          <span className="text-clay">▶</span><span className="text-[13px] font-medium">Watch the pitch + demo</span>
        </button>
        <button onClick={() => dispatch({ type: "examples", mode: "gallery" })} className="bg-paper text-ink border border-line rounded-full px-4 py-2.5 shadow-xl hover:bg-soft text-[13px] font-medium">More examples</button>
      </div>
    );
  }

  if (phase === "pitch") {
    const s = PITCH[slide];
    const last = slide >= PITCH.length - 1;
    return (
      <Overlay dark>
        <div className="max-w-2xl text-center">
          <div className="flex justify-center mb-8 text-white"><RelayMark size={44} /></div>
          <div className="eyebrow text-clay mb-4">The backstory · {slide + 1}/{PITCH.length}</div>
          <h1 key={slide} className="text-white text-4xl md:text-5xl font-light leading-[1.12] tracking-tight mb-5 animate-lane-in">{s.big}</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto mb-9">{s.sub}</p>
          {last ? (
            <div className="flex gap-3 justify-center">
              <button onClick={start} className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">See how it works →</button>
              <button onClick={stop} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Skip — explore myself</button>
            </div>
          ) : (
            <div className="flex items-center gap-4 justify-center">
              <button onClick={() => setSlide((x) => Math.max(0, x - 1))} className="text-white/50 hover:text-white text-[14px]" aria-label="Back">◀</button>
              <div className="flex gap-1.5">{PITCH.map((_, i) => <span key={i} className="h-1 rounded-full transition-all" style={{ width: i === slide ? 16 : 6, background: i === slide ? "var(--clay)" : "rgba(255,255,255,0.25)" }} />)}</div>
              <button onClick={() => setSlide((x) => x + 1)} className="text-white/50 hover:text-white text-[14px]" aria-label="Next">▶</button>
              <span className="w-px h-4 bg-white/20" />
              <button onClick={start} className="text-[12px] text-white/50 hover:text-white">Skip intro →</button>
            </div>
          )}
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
      { k: "The real work", t: "The platform is the structure. The folder is the substance.", b: "Everything you just saw is the **structure** — and it's the easy part. Claude is only ever as good as the folder you hand it. The context, the standards, the taste, the examples of “good” you put in the folder *is* the work. Thin folder, thin output. Crafted folder — real design direction and all — work you'd actually ship. **That craft is the skill. It's the methodology, ICM.**" },
    ];
    const c = cards[edu];
    return (
      <Overlay>
        <div className="max-w-xl">
          <div className="eyebrow text-clay mb-3">Under the hood · {edu + 1}/{cards.length}</div>
          <h2 className="text-3xl font-light tracking-tight text-ink mb-3">{c.t}</h2>
          <p className="text-ink-2 text-[15px] leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: c.b.replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink">$1</strong>') }} />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">{cards.map((_, i) => <span key={i} className="h-1 rounded-full" style={{ width: i === edu ? 18 : 6, background: i === edu ? "var(--clay)" : "var(--line)" }} />)}</div>
            <button onClick={() => (edu >= cards.length - 1 ? setPhase("terminal") : setEdu(edu + 1))} className="ml-auto bg-ink text-paper px-4 py-2 rounded-md text-[13px]">{edu >= cards.length - 1 ? "Now the autonomous way →" : "Next →"}</button>
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
        <p className="text-white/70 text-[16px] leading-relaxed mb-8">The full system adds real logins for every client, multiple businesses kept fully separate, a calendar that drives billing, a costs board, decisions, and org admin. We kept this demo deliberately specific so it stays clear and didn't go overboard. This is a new way for a team to actually <em className="text-white not-italic font-medium">do</em> the work — not just track it. The folder is the product; the product is yours.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => { stop(); dispatch({ type: "examples", mode: "gallery" }); }} className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">See 5 more ways teams use Relay →</button>
          <button onClick={() => { markSeen(); dispatch({ type: "beta", on: true }); }} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Join the private beta</button>
          <button onClick={stop} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Explore it yourself</button>
          <button onClick={openPitch} className="text-white/70 px-5 py-3 rounded-lg text-[15px] hover:text-white border border-white/20">Replay from the top</button>
        </div>
        <p className="text-white/60 text-[13px] mt-7 max-w-xl mx-auto leading-relaxed">The platform is the structure — that's the easy part. The quality comes from the folder you build. <a href={SCHOOL.url} target="_blank" rel="noreferrer" className="text-clay hover:underline">Learn the folder craft (ICM) in {SCHOOL.name} →</a></p>
        <div className="text-white/40 text-[11px] mt-6">Relay™ · © 2026 · a demo of what's possible — not the production product.</div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 animate-lane-in ${dark ? "bg-[#0B0B0C]" : "bg-paper/97 backdrop-blur"}`}>{children}</div>;
}
