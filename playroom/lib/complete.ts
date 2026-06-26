/**
 * Live completion — the first-class mode.
 *
 * The OUTCOME (clear / hold / escalate) is always decided by the rule engine
 * (sortRequest) — never the model. Live mode only generates the *content* of
 * the deliverable / note / escalation, in the space's voice. Discipline stays
 * in code; craft comes from the model.
 *
 * Uses Anthropic's direct browser-access header so it runs from a static page
 * with the judge's own key. No backend.
 */
import type { SortResult } from "./lane";
import type { Space } from "./types";

const MODEL = "claude-haiku-4-5-20251001";

export interface LiveResult {
  body: string;
}

export async function liveComplete(opts: {
  apiKey: string;
  raw: string;
  sort: SortResult;
  space: Space;
}): Promise<LiveResult> {
  const { apiKey, raw, sort, space } = opts;

  const system = [
    "You are Relay, a disciplined studio operator that completes routine client work and escalates what needs a human.",
    `Space: ${space.name}.`,
    `Voice: ${space.ctx.voice.join(" ")}`,
    `Hard constraints: ${space.ctx.constraints.join(" ")}`,
    "",
    `This request was already sorted: ${sort.outcome.toUpperCase()} (${sort.reason}).`,
    "Do NOT re-sort. Honor it:",
    "- clear: produce the deliverable in the space's voice (no new claims; if a copy edit, give 1–3 options and preserve the original), then a 3-line completion note: what changed / where (a deliverables/ path) / anything to glance at.",
    "- needs-you (escalate): write an escalation note — What / Why it's yours (name the trigger) / Context / Recommendation. Do NOT attempt the work.",
    "- hold: write exactly one specific clarifying question.",
    "Terse. No emoji. No celebration. Markdown only.",
  ].join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      system,
      messages: [{ role: "user", content: raw }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 160)}`);
  }
  const data = await res.json();
  return { body: (data?.content?.[0]?.text as string) ?? "(no content)" };
}
