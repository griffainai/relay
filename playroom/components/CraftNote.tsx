"use client";
import { SCHOOL, CRAFT } from "@/lib/promo";

// Inline callout (light surfaces — folder view, etc.)
export function CraftNote() {
  return (
    <div className="rounded-xl border border-clay/30 bg-clay/[0.06] p-4">
      <div className="eyebrow text-clay mb-1.5">{CRAFT.eyebrow}</div>
      <p className="text-[13.5px] text-ink leading-relaxed"><strong className="font-semibold">{CRAFT.headline}</strong> {CRAFT.body}</p>
      <p className="text-[13px] text-ink-2 leading-relaxed mt-2">{CRAFT.sharp}</p>
      <a href={SCHOOL.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] text-clay font-medium mt-2.5 hover:underline">
        {CRAFT.cta} Learn it in {SCHOOL.name} →
      </a>
    </div>
  );
}

// Compact one-liner (for footers / banners)
export function CraftLine({ dark }: { dark?: boolean }) {
  return (
    <p className={`text-[12.5px] leading-snug ${dark ? "text-white/55" : "text-muted"}`}>
      Every example here is only as good as the folder behind it. The structure's the easy part —{" "}
      <a href={SCHOOL.url} target="_blank" rel="noreferrer" className="text-clay hover:underline">the craft of the folder is ICM →</a>
    </p>
  );
}

// Full community promo — the "end" of the experience.
export function SchoolPromo() {
  return (
    <div className="rounded-2xl border border-clay/40 bg-clay/[0.08] p-6 text-center">
      <div className="eyebrow text-clay mb-2">The real work</div>
      <h3 className="text-white text-2xl font-light tracking-tight mb-2">You just saw the structure. The craft is the folder.</h3>
      <p className="text-white/70 text-[14px] leading-relaxed max-w-lg mx-auto mb-5">
        Everything Relay does is downstream of one thing: <strong className="text-white font-medium">how good your folder is</strong>. The depth, the standards, the taste, the examples of “good” — that's the work, and that's the skill. It's a craft you can learn: <span className="text-white">{SCHOOL.course}</span>.
      </p>
      <a href={SCHOOL.url} target="_blank" rel="noreferrer" className="inline-block bg-clay text-white px-6 py-3 rounded-lg text-[15px] font-medium hover:opacity-90">
        Learn to build folders like this → {SCHOOL.name}
      </a>
    </div>
  );
}
