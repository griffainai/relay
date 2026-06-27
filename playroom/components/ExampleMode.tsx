"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { EXAMPLES, DATASETS, activeDataset } from "@/lib/datasets";
import { RelayMark } from "./RelayMark";

interface Rect { top: number; left: number; width: number; height: number }

export function ExampleMode() {
  const { state, dispatch } = useStore();
  const mode = state.examples;
  const [beat, setBeat] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);

  const ds = DATASETS[state.dataset] ?? activeDataset();
  const beats = ds.vignette;

  const complete = (id: string) => dispatch({ type: "update", id, patch: { status: "complete", completedBy: "relay", completedAt: "now" } });
  const openExample = (id: string) => { dispatch({ type: "dataset", id }); setBeat(0); setPaused(false); dispatch({ type: "examples", mode: "vignette" }); };
  const backToGallery = () => dispatch({ type: "examples", mode: "gallery" });
  const toStudio = () => { dispatch({ type: "dataset", id: "studio" }); dispatch({ type: "examples", mode: null }); };

  // drive the reseeded site + measure the spotlight target
  useEffect(() => {
    if (mode !== "vignette") return;
    const b = beats[beat]; if (!b) return;
    b.do?.(dispatch, { complete });
    let cancelled = false;
    const measure = () => {
      if (cancelled || !b.selector) { setRect(null); return; }
      const el = document.querySelector(b.selector) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const t = setTimeout(measure, 460);
    window.addEventListener("resize", measure);
    return () => { cancelled = true; clearTimeout(t); window.removeEventListener("resize", measure); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, beat]);

  useEffect(() => {
    if (mode !== "vignette" || paused) return;
    const b = beats[beat]; if (!b) return;
    const t = setTimeout(() => (beat >= beats.length - 1 ? dispatch({ type: "examples", mode: "explore" }) : setBeat((x) => x + 1)), b.dur ?? 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, beat, paused]);

  if (!mode) return null;

  /* ───────── gallery ───────── */
  if (mode === "gallery") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0B0C] overflow-y-auto p-6 animate-lane-in">
        <div className="max-w-3xl mx-auto py-6">
          <div className="flex items-center gap-3 mb-3 text-white"><RelayMark size={32} /><span className="eyebrow text-clay">More examples</span></div>
          <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-3">Same engine. Five very different businesses.</h1>
          <p className="text-white/60 text-[15px] max-w-xl mb-8">Everything you just saw — the board, the lane protocol, the client portals, the folder — reseeded for five teams we haven't shown. Pick one and watch it run, then click around freely.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXAMPLES.map((e) => (
              <button key={e.id} onClick={() => openExample(e.id)} className="text-left rounded-xl border border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:border-clay/50 p-5 transition-all group">
                <div className="flex items-center gap-2.5 mb-2"><span className="text-2xl">{e.icon}</span><span className="text-white text-[16px] font-medium">{e.label}</span></div>
                <div className="text-white/55 text-[13px] mb-3">{e.blurb}</div>
                <div className="text-white/80 text-[13px] leading-snug border-t border-white/10 pt-3"><span className="text-clay">The wow · </span>{e.wow}</div>
                <div className="text-clay text-[12px] mt-3 opacity-0 group-hover:opacity-100 transition">Run this example →</div>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <button onClick={() => dispatch({ type: "examples", mode: "offer" })} className="bg-clay text-white px-5 py-2.5 rounded-lg text-[14px] font-medium hover:opacity-90">See the offer →</button>
            <button onClick={toStudio} className="text-white/60 hover:text-white px-4 py-2.5 text-[14px] border border-white/15 rounded-lg">← Back to the main demo</button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────── vignette (spotlight over the reseeded site) ───────── */
  if (mode === "vignette") {
    const b = beats[beat];
    return (
      <>
        {rect ? (
          <div className="fixed z-40 rounded-lg pointer-events-none transition-all duration-700"
            style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: "0 0 0 9999px rgba(11,11,12,0.6)", border: "2.5px solid var(--clay)" }} />
        ) : <div className="fixed inset-0 z-40 bg-ink/60" />}

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[660px] max-w-[92vw]">
          <div className="rounded-2xl bg-paper border border-line shadow-2xl px-6 py-5 animate-lane-in" key={beat}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{ds.icon}</span>
              <span className="eyebrow text-clay">{b?.chapter}</span>
              <span className="text-[11px] text-muted ml-auto font-mono">Step {beat + 1} of {beats.length}</span>
            </div>
            <h2 className="text-[23px] font-medium text-ink leading-tight mb-2 tracking-tight">{b?.title}</h2>
            <p className="text-[15px] text-ink-2 leading-relaxed">{b?.text}</p>
            <div className="mt-3.5 h-1 rounded-full bg-line overflow-hidden"><div className="h-full bg-clay transition-all duration-500" style={{ width: `${((beat + 1) / beats.length) * 100}%` }} /></div>
          </div>
        </div>

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink/92 text-white rounded-full px-4 py-2 shadow-xl backdrop-blur">
          <button onClick={() => setBeat((x) => Math.max(0, x - 1))} className="text-white/70 hover:text-white text-[13px]">◀ Back</button>
          <button onClick={() => setPaused((p) => !p)} className="text-white text-[12px] px-2">{paused ? "▶ Play" : "❚❚ Pause"}</button>
          <button onClick={() => (beat >= beats.length - 1 ? dispatch({ type: "examples", mode: "explore" }) : setBeat((x) => x + 1))} className="text-white/70 hover:text-white text-[13px]">Next ▶</button>
          <span className="w-px h-4 bg-white/20" />
          <button onClick={() => dispatch({ type: "examples", mode: "explore" })} className="text-[11px] text-white/60 hover:text-white">Explore freely</button>
          <button onClick={backToGallery} className="text-[11px] text-white/60 hover:text-white">✕ Examples</button>
        </div>
      </>
    );
  }

  /* ───────── explore (slim banner over the live, reseeded site) ───────── */
  if (mode === "explore") {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink/92 text-white rounded-full pl-4 pr-3 py-2 shadow-xl backdrop-blur animate-lane-in max-w-[94vw]">
        <span className="text-base">{ds.icon}</span>
        <span className="text-[12.5px]">Exploring the <strong className="font-medium">{ds.label}</strong> example — click around freely.</span>
        <span className="w-px h-4 bg-white/20" />
        <button onClick={() => { setBeat(0); dispatch({ type: "examples", mode: "vignette" }); }} className="text-[12px] text-white/70 hover:text-white">↻ Replay</button>
        <button onClick={backToGallery} className="text-[12px] text-white/70 hover:text-white">← Examples</button>
        <button onClick={() => dispatch({ type: "examples", mode: "offer" })} className="text-[12px] text-clay hover:text-white">See the offer →</button>
      </div>
    );
  }

  /* ───────── the Grand Slam Offer ───────── */
  const STACK = [
    ["The folder-based work OS", "you own it — board, files, the lot", "$12,000"],
    ["An AI operator that clears your queue", "routine done, judgment escalated", "$24,000/yr"],
    ["Scoped client portals", "they ask, reply, approve, and book", "$6,000"],
    ["The engagement system", "plans, deliverables, billing, meetings", "$4,000"],
    ["Drop-the-folder-into-Claude autonomy", "no app required — works anywhere", "$8,000"],
    ["Works for any vertical", "the five you just saw — and yours", "priceless"],
  ];
  return (
    <div className="fixed inset-0 z-50 bg-[#0B0B0C] overflow-y-auto p-6 animate-lane-in">
      <div className="max-w-2xl mx-auto py-6">
        <div className="flex items-center gap-3 mb-3 text-white"><RelayMark size={32} /><span className="eyebrow text-clay">The offer</span></div>
        <h1 className="text-white text-3xl md:text-[40px] font-light leading-[1.1] tracking-tight mb-4">Run more clients — or a whole second business — <span className="text-clay">with the same small team.</span></h1>
        <p className="text-white/65 text-[16px] leading-relaxed mb-8">Because the routine work does itself, and you only ever touch what needs judgment. Here's exactly what you get.</p>

        <div className="rounded-2xl border border-white/12 bg-white/[0.03] divide-y divide-white/8 mb-6">
          {STACK.map(([t, sub, val]) => (
            <div key={t} className="flex items-baseline gap-3 px-5 py-3.5">
              <span className="text-clay text-[13px]">✓</span>
              <span className="text-white text-[14px] font-medium">{t}</span>
              <span className="text-white/45 text-[12px] hidden sm:inline">— {sub}</span>
              <span className="ml-auto text-white/70 text-[13px] font-mono shrink-0">{val}</span>
            </div>
          ))}
          <div className="flex items-baseline gap-3 px-5 py-3.5 bg-white/[0.02]">
            <span className="text-white/50 text-[13px] ml-auto">Total value</span>
            <span className="text-white/50 text-[13px] font-mono line-through">$54,000+</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-7">
          <div className="rounded-xl border border-clay/40 bg-clay/10 p-4">
            <div className="eyebrow text-clay mb-1.5">The guarantee</div>
            <div className="text-white/85 text-[13px] leading-snug">If it doesn't clear real work in your first week, you don't pay — and you keep the folder.</div>
          </div>
          <div className="rounded-xl border border-white/12 p-4">
            <div className="eyebrow text-white/50 mb-1.5">Honest scarcity</div>
            <div className="text-white/70 text-[13px] leading-snug">We onboard a few teams at a time so each setup is sharp. Founding pricing before it's productized.</div>
          </div>
          <div className="rounded-xl border border-white/12 p-4">
            <div className="eyebrow text-white/50 mb-1.5">What it's called</div>
            <div className="text-white/70 text-[13px] leading-snug">The Folder-Based Operations Install — set up around <em>your</em> work, live in days.</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a href="https://relay-playroom.vercel.app" className="bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">Try the live demo →</a>
          <button onClick={() => dispatch({ type: "examples", mode: "explore" })} className="text-white/75 px-5 py-3 rounded-lg text-[14px] border border-white/20 hover:text-white">Keep exploring this example</button>
          <button onClick={backToGallery} className="text-white/55 px-4 py-3 text-[13px] hover:text-white">← All examples</button>
          <button onClick={toStudio} className="text-white/55 px-4 py-3 text-[13px] hover:text-white ml-auto">✕ Back to the demo</button>
        </div>
        <div className="text-white/35 text-[11px] mt-7">Relay™ · © 2026 · figures are illustrative — this is the vision, not a price sheet.</div>
      </div>
    </div>
  );
}
