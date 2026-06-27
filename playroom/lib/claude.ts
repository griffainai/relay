// Live, bring-your-own-key Claude. The key is the visitor's own, entered by them,
// kept only in their browser, and used ONLY to call Anthropic directly. Never sent
// anywhere else, never committed. This is the app's real core loop: read the folder
// (rules + the client's context) → sort the request → do it or escalate.
import type { Engagement, Space, Task } from "./types";

const MODEL = "claude-sonnet-4-6";

export interface LiveResult {
  lane: "clear" | "hold" | "escalate";
  note?: string;
  question?: string;
  escalation?: string;
  deliverable?: { title: string; body: string };
}

export function buildSystem(space?: Space, engagement?: Engagement): string {
  return [
    "You are Relay, a folder-based studio operator. You read a client's folder and either do the routine work or escalate what needs a human. You never invent facts or make claims you can't support from the folder.",
    "",
    "THE LANE PROTOCOL (this is rules.md — follow it exactly). Sort the request into ONE lane:",
    "• CLEAR — reversible, unambiguous, routine (copy edits, content/section updates, drafts, summaries, answering from the folder). Do it, then write a tight 3-line completion note. If you produced something, put it in `deliverable`. Never publish, send, pay, negotiate, or touch anything irreversible.",
    "• HOLD — if it's ambiguous or missing a fact you'd need, ask EXACTLY ONE crisp question. Don't guess.",
    "• ESCALATE — anything irreversible, money/pricing, production/publishing, scope changes, legal/medical/tax judgment, or sending something outbound on the client's behalf. Do NOT attempt it. Write a short note: what it is / why it's a human's call / your recommendation.",
    "",
    `CLIENT: ${space?.name ?? "the client"}. ${space?.blurb ?? ""}`.trim(),
    space?.ctx?.voice?.length ? `VOICE (write in this): ${space.ctx.voice.join(" ")}` : "",
    space?.ctx?.constraints?.length ? `CONSTRAINTS (never violate these — they decide escalations): ${space.ctx.constraints.join(" · ")}` : "",
    engagement ? `ENGAGEMENT: ${engagement.tier}, phase ${engagement.phase}. Goal: ${engagement.isa?.goal ?? "—"}` : "",
    "",
    "Respond with ONLY a JSON object — no prose, no markdown fences:",
    `{"lane":"clear"|"hold"|"escalate","note":"<3-line completion note, only if clear>","question":"<one question, only if hold>","escalation":"<what / why it's yours / recommendation, only if escalate>","deliverable":{"title":"<short>","body":"<markdown, only if you actually produced work>"}}`,
    "Include only the fields relevant to the lane you chose. Keep it tight and in the client's voice.",
  ].filter(Boolean).join("\n");
}

export async function runTaskLive(opts: { apiKey: string; task: Task; space?: Space; engagement?: Engagement }): Promise<LiveResult> {
  const { apiKey, task, space, engagement } = opts;
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
      max_tokens: 1500,
      system: buildSystem(space, engagement),
      messages: [{ role: "user", content: `Request ${task.id}: ${task.title}\n\n"${task.description}"` }],
    }),
  });

  if (!res.ok) {
    let msg = `Anthropic API error (${res.status})`;
    if (res.status === 401) msg = "That key was rejected (401). Check it and try again.";
    else { try { const e = await res.json(); msg = e?.error?.message || msg; } catch {} }
    throw new Error(msg);
  }

  const data = await res.json();
  const text = (data?.content?.[0]?.text || "").trim();
  const jsonStr = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const parsed = JSON.parse(jsonStr) as LiveResult;
    if (!parsed.lane) parsed.lane = "clear";
    return parsed;
  } catch {
    // model didn't return clean JSON — treat the text as a completion note
    return { lane: "clear", note: text.slice(0, 700) };
  }
}
