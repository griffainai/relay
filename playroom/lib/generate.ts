// Generate a complete, ready-to-use ICM folder from a few answers about a
// business. The output is the *substance* scaffolded into our structure — the
// user fills/edits, then drops it into Claude or runs it in the app.

export interface BizInput {
  biz: string;
  what: string;
  voice: string;
  solo: boolean;
  clients: { name: string; work: string }[];
  clears: string[];
  escalates: string[];
}

export interface GenFile { path: string; content: string }

export const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "client";

const list = (xs: string[]) => xs.filter(Boolean).map((x) => `- ${x}`).join("\n") || "- (add your own)";

export function generateFolder(b: BizInput): GenFile[] {
  const root = slug(b.biz) || "my";
  const voice = b.voice.trim() || "Clear, direct, no fluff.";
  const clients = b.clients.filter((c) => c.name.trim());
  const files: GenFile[] = [];

  files.push({ path: "START-HERE.md", content:
`# ${b.biz} — your Relay folder

This is your operator, as a folder. Two ways to use it:

## A · Instant (no install)
Drop this whole folder into a **Claude Project** (or paste the files into a chat).
Claude reads \`CLAUDE.md → identity.md → rules.md\` and becomes your operator.
Then talk to it like you would a teammate: *"draft a reply to this client", "update the homepage line"* — it clears the routine and escalates what needs you.

## B · Your own app (the full UI)
1. Clone the open app: \`github.com/griffainai/relay\` → \`playroom/\`
2. Put this folder in \`playroom/studio/\` (replace the demo clients).
3. \`npm install && npm run dev\` → open the board.
4. Click a task → **Run live with Claude** → paste your own Anthropic key.

The folder is the source of truth. The app is just a window onto it. **It's yours.**
` });

  files.push({ path: "CLAUDE.md", content:
`# ${b.biz} — the Map (Layer 1, always loaded)

You are the operator for **${b.biz}**. ${b.what}

Routing:
- A request comes in → read \`rules.md\` (the Lane Protocol) and sort it.
- Need the voice or standards → read \`reference/voice.md\`.
- Working a specific client → read \`clients/<client>/CONTEXT.md\` first.
- Routine type you can clear → see \`reference/playbook.md\`.

Hold directions here, not knowledge. The depth lives in the rooms and the client folders.
` });

  files.push({ path: "identity.md", content:
`# Identity

I run the routine work for **${b.biz}** so the humans only touch what needs judgment.
${b.what}

**How I behave:** I do the clear, reversible work and write a short note. I ask one question when I'm unsure. I escalate anything that's irreversible, costs money, or needs a human's call — I never guess on those.

**Voice (everything I produce sounds like this):** ${voice}
` });

  files.push({ path: "rules.md", content:
`# The Lane Protocol — the engine

Sort every request into exactly one lane.

## 🟢 CLEAR — do it, then write a 3-line note
Reversible, unambiguous, and one of these routine types:
${list(b.clears)}

## 🟡 HOLD — ask exactly one question
If it's ambiguous or missing a fact I'd need. Don't guess.

## 🔴 ESCALATE — hand to a human, never attempt
Always escalate:
${list(b.escalates)}

The constraints above are absolute. When in doubt, escalate.
` });

  files.push({ path: "reference/playbook.md", content:
`# Playbook — what I may CLEAR

${list(b.clears)}

If a request isn't here and isn't obviously routine + reversible, treat it as HOLD or ESCALATE.
` });
  files.push({ path: "reference/voice.md", content:
`# Voice — ${b.biz}

${voice}

## Words we use
- (phrases, tone, rhythm you want)

## Words we ban
- (jargon, clichés, anything off-brand)
` });

  files.push({ path: "reference/standards.md", content:
`# Standards — what "good" means for ${b.biz}

> This file is where output quality comes from. The more specific you are, the better the work. Go deep.

## Quality bar
- (what "done well" looks like — be concrete)

## Design / format
- (layout, length, structure, design system, brand rules, do's and don'ts)

## Checklist before anything ships
- [ ] In our voice (see voice.md)
- [ ] No new claims we can't back up
- [ ] (your own checks)
` });

  files.push({ path: "reference/examples.md", content:
`# Examples of good (and bad) — ${b.biz}

> The single highest-leverage file. Paste real before/after. Claude matches your examples.

## ✅ Good
\`\`\`
(paste a real piece of work you were proud of, and one line on why)
\`\`\`

## ❌ Not it
\`\`\`
(paste something off-brand, and why it misses)
\`\`\`
` });

  const clientList = clients.length ? clients : [{ name: b.solo ? b.biz : "First client", work: b.what }];
  clientList.forEach((c) => {
    const cs = slug(c.name);
    files.push({ path: `clients/${cs}/CONTEXT.md`, content:
`# ${c.name} — context

What we do for them: ${c.work || "—"}

## Voice
${voice}

## Constraints (their specifics)
- (add anything specific to this client)
` });
    files.push({ path: `clients/${cs}/GOALS.md`, content:
`# Goals — ${c.name}

## Problem
(what they came to you with)

## Outcome they want
(the end state, in their words)

## Done means
- (a concrete, checkable result)
` });
    files.push({ path: `clients/${cs}/STATE.md`, content: `# State — ${c.name}\n\n- (current status; the operator keeps this updated)\n` });
    files.push({ path: `clients/${cs}/requests/_example.md`, content:
`# req-001 — example request

**From:** ${c.name}
**Asked:** "(paste a real request they'd send you)"

---
The operator sorts this 🟢/🟡/🔴 by rules.md, then does it or escalates.
` });
  });

  files.push({ path: "README.md", content:
`# ${b.biz} — Relay folder

Built with **Interpretable Context Methodology (ICM)**. The structure came from Relay; the substance is yours.

- \`CLAUDE.md\` — the map · \`identity.md\` — who your operator is · \`rules.md\` — the Lane Protocol
- \`reference/\` — your playbook + voice/standards (this is where quality comes from — go deep)
- \`clients/<name>/\` — one folder per client: context, goals, state, requests

See \`START-HERE.md\`. Learn to make the folder great: the methodology is ICM.
` });

  return files;
}
