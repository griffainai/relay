import type { Task } from "./types";
import { statusLabel } from "./board";

const OUTCOME_GLYPH = (t: Task): string => {
  if (t.status === "complete") return "🟢 complete";
  if (t.escalation) return "🔴 needs you (escalated)";
  if (t.holdQuestion) return "🟡 hold";
  return statusLabel(t.status).toLowerCase();
};

/**
 * Render a task as its canonical markdown file — what the "board is the files"
 * reveal shows: the UI on one side, THIS on the other, in sync.
 */
export function taskToMarkdown(t: Task): string {
  const L: string[] = [];
  L.push(`# ${t.id} — ${t.title}`);
  L.push(`- Space: ${cap(t.spaceSlug)}`);
  if (t.projectName) L.push(`- Project: ${t.projectName}`);
  L.push(`- Filed-by: ${t.filedBy}`);
  L.push(`- Priority: ${t.priority.toUpperCase()}`);
  L.push(`- Assignee: ${t.assignee ?? "unassigned"}`);
  L.push(`- Status: ${OUTCOME_GLYPH(t)}`);
  if (t.reason) L.push(`- Reason: ${t.reason}`);
  if (t.playbook) L.push(`- Playbook: ${t.playbook}`);
  if (t.labels.length) L.push(`- Labels: ${t.labels.join(", ")}`);
  L.push("");
  L.push("## Description");
  L.push(`> ${t.description}`);
  L.push("");
  if (t.checklist.length) {
    L.push("## Checklist");
    t.checklist.forEach((c) => L.push(`- [${c.done ? "x" : " "}] ${c.text}`));
    L.push("");
  }
  if (t.deliverable) {
    L.push(`## Deliverable — ${t.deliverable.title}`);
    L.push(t.deliverable.body);
    L.push("");
  }
  if (t.completionNote) {
    L.push("## Completion note");
    L.push(t.completionNote);
    L.push("");
  }
  if (t.escalation) {
    L.push("## Escalation note");
    L.push(t.escalation);
    L.push("");
  }
  if (t.holdQuestion) {
    L.push("## Hold question");
    L.push(`> ${t.holdQuestion}`);
    L.push("");
  }
  if (t.comments.length) {
    L.push("## Thread");
    t.comments.forEach((c) => L.push(`- **${c.author}** (${c.at}): ${c.body}`));
    L.push("");
  }
  return L.join("\n").trim() + "\n";
}

function cap(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
