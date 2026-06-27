"use client";
import { useStore } from "@/lib/store";

interface Review { name: string; role?: string; stars: number; text: string }

const SEEDED: Review[] = [
  { name: "Maya R.", role: "studio owner", stars: 5, text: "The folder-as-truth idea finally made AI useful for client work. I copy the prompt, Claude does it, I paste the note. Done." },
  { name: "Devon K.", role: "freelancer", stars: 5, text: "The escalation discipline sold me — it does the routine stuff and leaves the judgment calls to me." },
  { name: "Priya S.", role: "agency lead", stars: 4, text: "“View as” showing client vs exec access is slick. Clients only ever see their own requests." },
  { name: "Marcus T.", role: "solo operator", stars: 5, text: "Uploading the whole client folder to Claude and watching it clear the queue is the magic moment." },
];

function Stars({ n }: { n: number }) {
  return <span className="text-clay text-[13px]">{"★".repeat(n)}<span className="text-line">{"★".repeat(5 - n)}</span></span>;
}

export function ReviewsWall() {
  const { state, dispatch } = useStore();
  if (!state.wall) return null;
  let mine: Review[] = [];
  try {
    mine = (JSON.parse(localStorage.getItem("relay-feedback") || "[]") as any[])
      .filter((f) => f.stars)
      .map((f) => ({ name: "You", stars: f.stars, text: f.like || f.improve || "Left a rating." }))
      .reverse();
  } catch {}
  const reviews = [...mine, ...SEEDED];
  const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
  const close = () => dispatch({ type: "wall", on: false });

  return (
    <div className="fixed inset-0 z-[78] flex items-center justify-center p-6" onClick={close}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative w-[680px] max-w-[94vw] max-h-[86vh] rounded-xl border border-line bg-paper shadow-xl flex flex-col animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 h-14 border-b border-line shrink-0">
          <div>
            <div className="text-[16px] font-medium text-ink">What people are saying</div>
            <div className="text-[11px] text-muted flex items-center gap-1.5"><Stars n={Math.round(Number(avg))} /> {avg} · {reviews.length} reviews</div>
          </div>
          <button onClick={() => { close(); dispatch({ type: "review", on: true }); }} className="ml-auto text-[12.5px] bg-ink text-paper px-3 py-1.5 rounded-md">★ Add yours</button>
          <button onClick={close} aria-label="Close" className="text-muted hover:text-ink text-[16px]">×</button>
        </div>
        <div className="overflow-y-auto p-5 grid grid-cols-2 gap-3">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-lg border border-line bg-paper p-3.5">
              <Stars n={r.stars} />
              <p className="text-[13px] text-ink-2 leading-relaxed mt-1.5 mb-2">“{r.text}”</p>
              <div className="text-[12px] text-ink font-medium">{r.name}{r.role && <span className="text-muted font-normal"> · {r.role}</span>}</div>
            </div>
          ))}
        </div>
        <div className="px-5 py-2.5 border-t border-line text-[11px] text-muted shrink-0">
          Public wall · seeded + this browser's reviews. Point it at a shared store (Supabase/Formspree) and every visitor's review shows here for everyone.
        </div>
      </div>
    </div>
  );
}
