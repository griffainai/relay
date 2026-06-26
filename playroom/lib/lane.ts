/**
 * The Lane Protocol — as code.
 *
 * `rules.md` made executable. The same hard-trigger list + playbook that define
 * the specialist sort any request a judge types. The rules file runs the demo.
 *
 * The sort produces one of three OUTCOMES (clear / hold / escalate). The board
 * then maps those onto task statuses: clear → complete, hold → waiting-on,
 * escalate → stays open + flagged for the owner.
 */
import type { Space } from "./types";

export type SortOutcome = "clear" | "hold" | "needs-you";
type PlaybookKind = "copy" | "content" | "page" | "seo" | "fix" | "digest";

export interface SortResult {
  outcome: SortOutcome;
  reason: string;
  playbook?: string;
  kind?: PlaybookKind;
  trigger?: string;
}

const HARD: { test: RegExp; trigger: string }[] = [
  { test: /\b(delete|remove|wipe|erase|take ?down|drop|undo everything)\b/i, trigger: "irreversible" },
  { test: /\b(publish|go ?live|deploy|ship it|push (it |the .* )?live|launch|dns|domain|production)\b/i, trigger: "production" },
  { test: /\b(pric(e|ing)|invoice|refund|quote|discount|charge|payment|\$\s?\d|\bcosts?\b)\b/i, trigger: "money" },
  { test: /\b(e-?mail|send|text|sms|call|reply to|message)\b[^.?!]*\b(client|customer|them|dana|the owner)\b/i, trigger: "outbound to client" },
  { test: /\b(redesign|rebuild|overhaul|revamp|moderni[sz]e|whole site|entire site|the site|everything|freshen (it |the .* )?up|make it (pop|better|nicer|fresh)|from scratch|spruce)\b/i, trigger: "scope / open-ended" },
];

const PLAYBOOK: { id: string; kind: PlaybookKind; test: RegExp }[] = [
  { id: "DIGEST-001", kind: "digest", test: /\b(status|where are we|where do (things|we) stand|update me|stand-?up|what'?s (going on|happening|left|the status)|catch me up|brief me)\b/i },
  { id: "SEO-001", kind: "seo", test: /\b(meta( description| title)?|description tag|title tag|alt[- ]?text|seo)\b/i },
  { id: "PAGE-001", kind: "page", test: /\b(add|insert|include|put)\b[^.?!]*\b(faq|testimonial|review|section|block|quote)\b/i },
  { id: "CONTENT-001", kind: "content", test: /\b(swap|replace|update|change|switch)\b[^.?!]*\b(photo|image|picture|logo|bio|headshot|graphic)\b/i },
  { id: "COPY-001", kind: "copy", test: /\b(headline|copy|wording|tagline|cta|button( label)?|paragraph|rewrite|reword|sub-?head|hero text|the text|hours)\b/i },
  { id: "FIX-001", kind: "fix", test: /\b(typo|spelling|misspell(ed|ing)?|broken link|dead link|wrong (year|date|number)|fix the)\b/i },
];

const VAGUE = /\b(the new one|that one|the latest|the updated one|the right one)\b/i;

export function sortRequest(raw: string): SortResult {
  const t = (raw || "").trim();
  if (!t) return { outcome: "needs-you", reason: "empty" };
  for (const h of HARD) {
    if (h.test.test(t)) return { outcome: "needs-you", reason: `${h.trigger} — hard trigger`, trigger: h.trigger };
  }
  const pb = PLAYBOOK.find((p) => p.test.test(t));
  if (!pb) return { outcome: "needs-you", reason: "novelty — not in the playbook", trigger: "novelty" };
  if (pb.kind === "content" && VAGUE.test(t) && !/\bdrive|folder|attached|this file\b/i.test(t)) {
    return { outcome: "hold", reason: "in playbook, but the source asset isn't named", playbook: pb.id, kind: pb.kind };
  }
  return { outcome: "clear", reason: `${labelFor(pb.kind)} — reversible, in playbook`, playbook: pb.id, kind: pb.kind };
}

function labelFor(kind: PlaybookKind): string {
  return { copy: "copy edit", content: "content swap", page: "page change", seo: "meta edit", fix: "factual correction", digest: "status digest" }[kind];
}

export interface CompletionResult {
  deliverable?: { title: string; body: string };
  completionNote?: string;
  escalation?: string;
  holdQuestion?: string;
}

export function bakedCompletion(raw: string, sort: SortResult, space: Space): CompletionResult {
  const lower = space.slug === "acme-studio";
  const v = (s: string) => (lower ? s.toLowerCase() : s);

  if (sort.outcome === "needs-you") {
    return {
      escalation: [
        `What: ${raw.trim()}`,
        `Why it's yours: ${sort.trigger} — I don't cross that line autonomously.`,
        `Context: I gathered what's here and left the work untouched.`,
        `Recommendation: you make the call; I'll handle the parts that become routine once you do.`,
      ].join("\n"),
    };
  }
  if (sort.outcome === "hold") {
    return { holdQuestion: "Happy to do this — which asset, and where is it? Name it and I'll complete it." };
  }
  switch (sort.kind) {
    case "copy":
      return {
        deliverable: {
          title: "Headline / copy — options",
          body: [
            `**Original (preserved)**`,
            `> ${space.name} — the current line`,
            ``,
            `**1. (recommended)** ${v("Same-Day Quotes, From Neighbors You Trust")}`,
            `**2.** ${v("Need It Today? Fast, Fair, Done Right.")}`,
            `**3.** ${v("Local, Licensed, and Ready When You Are.")}`,
            ``,
            `_Copy only. In ${space.name}'s voice. No new claims._`,
          ].join("\n"),
        },
        completionNote: `Rewrote the copy — 3 options, #1 recommended.\ndeliverables/copy.md\nOriginal preserved. Copy only. Reversible.`,
      };
    case "seo":
      return {
        deliverable: { title: "Meta description", body: `> ${v("clear, specific copy for this page — written to read like a human, not a keyword list.")}\n\n_148 / 155 chars._` },
        completionNote: `Wrote the meta description (148 chars), in voice.\ndeliverables/meta.md\nUnder the 155 limit. Reversible.`,
      };
    case "page":
      return {
        deliverable: { title: "New block (additive)", body: `A self-contained block from approved content, in ${space.name}'s voice. Placed without restructuring the page.` },
        completionNote: `Added the block from approved content.\ndeliverables/block.md\nAdditive only. Reversible.`,
      };
    case "fix":
      return {
        deliverable: { title: "Correction", body: `- **Before:** the existing value\n- **After:** the corrected value` },
        completionNote: `Made the correction.\ndeliverables/fix.md\nSingle change, reversible.`,
      };
    case "digest":
      return { completionNote: `Read the board (read-only — changed nothing).`, deliverable: { title: "Status", body: `See the board — escalations first, then holds, then cleared.` } };
    default:
      return { completionNote: "Completed." };
  }
}
