// Folder-quality scorer. The point it teaches: the structure is free; the quality
// of what Claude produces tracks the depth you put in the folder. Even a perfect
// form is only a "starter" — the craft is filling it deep. That craft is ICM.
import type { BizInput } from "./generate";

export interface Check { label: string; ok: boolean; hint: string }
export interface FolderScore { pct: number; grade: string; blurb: string; checks: Check[] }

export function scoreInput(b: BizInput): FolderScore {
  const checks: Check[] = [
    { label: "Specific about the work", ok: b.what.trim().length > 18, hint: "Say exactly what you do — concrete beats generic. Claude can only be as specific as you are." },
    { label: "A real voice, defined", ok: b.voice.trim().length > 14, hint: "Add words you'd use and words you'd ban. Voice is most of what makes output feel like you." },
    { label: "Context for who you serve", ok: b.clients.some((c) => c.name.trim() && c.work.trim()), hint: "Give each client real context — the situation, not just a name." },
    { label: "Routine work mapped (3+)", ok: b.clears.filter((x) => x.trim()).length >= 3, hint: "List more of what should clear automatically — that's where the leverage is." },
    { label: "Hard limits set (3+)", ok: b.escalates.filter((x) => x.trim()).length >= 3, hint: "Name what must always escalate. The limits are your safety and your trust." },
    // The teaching check — the starter can't contain your taste yet. This is the craft.
    { label: "Depth: examples, standards, taste", ok: false, hint: "The big one. Add real examples of “good”, a design/quality standard, and past requests. This is where output quality actually comes from — and it's the work only you can do." },
  ];
  const got = checks.filter((c) => c.ok).length;
  const pct = Math.round((got / checks.length) * 100);
  const grade = pct >= 83 ? "Solid start" : pct >= 50 ? "Starter" : "Bare";
  const blurb = pct >= 83
    ? "Good scaffold. Now go deep — the last 20% (examples, standards, taste) is where shippable quality lives."
    : "This is a structure, not yet a craftsman. Fill it with real depth and the output quality climbs with it.";
  return { pct, grade, blurb, checks };
}
