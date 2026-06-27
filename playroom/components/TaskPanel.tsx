"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "./Avatar";
import { TaskChip } from "./StatusChip";
import { Markdown } from "./Markdown";
import { taskToMarkdown } from "@/lib/serialize";
import { spaceBySlug, person, LABELS } from "@/lib/studio";
import { PRIORITY_PILL } from "@/lib/board";
import type { DetailTab } from "@/lib/store";
import type { Task } from "@/lib/types";

const VIEWER = "jay" as const; // the demo viewer

function buildPrompt(t: Task): string {
  const space = spaceBySlug(t.spaceSlug);
  return [
    `You are Relay, completing a task for ${space?.name ?? t.spaceSlug}.`,
    `Voice: ${space?.ctx.voice.join(" ")}`,
    `Constraints: ${space?.ctx.constraints.join(" ")}`,
    ``,
    `Task ${t.id}: ${t.title}`,
    `Request: ${t.description}`,
    ``,
    `Complete it in voice, no new claims. Then write a 3-line completion note.`,
  ].join("\n");
}

export function TaskPanel({ t }: { t: Task }) {
  const { state, dispatch } = useStore();
  const space = spaceBySlug(t.spaceSlug);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const tab = state.detailTab;
  const setTab = (x: DetailTab) => dispatch({ type: "detailTab", tab: x });

  const complete = () => {
    dispatch({
      type: "update",
      id: t.id,
      patch: { status: "complete", completionNote: note || "Completed by hand.", completedBy: VIEWER, completedAt: "just now" },
    });
    setNote("");
  };

  const send = () => {
    if (!draft.trim()) return;
    dispatch({ type: "comment", id: t.id, comment: { id: `c-${Date.now()}`, author: VIEWER, body: draft.trim(), at: "now" } });
    setDraft("");
  };

  const react = (cid: string) => {
    const c = t.comments.find((x) => x.id === cid);
    if (!c) return;
    const has = c.reactions?.some((r) => r.glyph === "❤️" && r.by.includes(VIEWER));
    const reactions = has
      ? (c.reactions ?? []).map((r) => (r.glyph === "❤️" ? { ...r, by: r.by.filter((b) => b !== VIEWER) } : r)).filter((r) => r.by.length)
      : [...(c.reactions ?? []).filter((r) => r.glyph !== "❤️"), { glyph: "❤️", by: [...(c.reactions?.find((r) => r.glyph === "❤️")?.by ?? []), VIEWER] }];
    dispatch({ type: "update", id: t.id, patch: { comments: t.comments.map((x) => (x.id === cid ? { ...x, reactions } : x)) } });
  };

  const copyPrompt = () => {
    const p = t.agentPrompt ?? buildPrompt(t);
    navigator.clipboard?.writeText(p).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const genPrompt = () => dispatch({ type: "update", id: t.id, patch: { agentPrompt: buildPrompt(t) } });
  const routeExec = () => {
    dispatch({ type: "update", id: t.id, patch: { spaceSlug: "executive" } });
    dispatch({ type: "comment", id: t.id, comment: { id: `c-${Date.now()}`, author: VIEWER, body: "Routed to Executive for a call.", at: "now" } });
  };
  return (
    <div data-demo="panel" className="w-[420px] shrink-0 border-l border-line bg-paper flex flex-col h-full">
      {/* header */}
      <div className="flex items-center gap-2 px-4 h-[52px] border-b border-line shrink-0">
        <span className="font-mono text-[11px] text-muted">{t.id}</span>
        <TaskChip task={t} />
        <div className="ml-auto flex items-center gap-1 rounded-md border border-line p-0.5">
          <MiniTab on={!state.fileMode} onClick={() => dispatch({ type: "fileMode", on: false })}>App</MiniTab>
          <MiniTab on={state.fileMode} onClick={() => dispatch({ type: "fileMode", on: true })}>File ·md</MiniTab>
        </div>
        <button aria-label="Close panel" onClick={() => dispatch({ type: "select", id: undefined })} className="text-muted hover:text-ink text-[16px] px-1">×</button>
      </div>

      {state.fileMode ? (
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-[12px] font-mono text-ink-2 whitespace-pre-wrap leading-relaxed">{taskToMarkdown(t)}</pre>
        </div>
      ) : (
        <>
          {/* tab bar */}
          <div className="flex items-center gap-1 px-3 h-10 border-b border-line shrink-0">
            {(["details", "conversation", "files", "activity"] as DetailTab[]).map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`text-[12.5px] px-2.5 py-1 rounded-md capitalize ${tab === x ? "bg-soft text-ink font-medium" : "text-ink-2 hover:text-ink"}`}
              >
                {x === "conversation" ? `Conversation${t.comments.length ? ` (${t.comments.length})` : ""}` : x}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {tab === "details" && (
              <>
                <div>
                  <div className="text-[14px] font-medium text-ink mb-1">{t.title}</div>
                  <div className="text-[13px] text-ink-2 leading-relaxed border-l-2 border-line pl-3">{t.description}</div>
                </div>

                {/* field grid */}
                <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                  <Field label="Space"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: space?.color }} />{space?.name}</span></Field>
                  <Field label="Assignee"><span className="flex items-center gap-1.5"><Avatar id={t.assignee} size={16} />{person(t.assignee)?.name ?? "Unassigned"}</span></Field>
                  <Field label="Priority">{PRIORITY_PILL[t.priority]?.label ?? "Low"}</Field>
                  <Field label="Status">{t.status}</Field>
                  <div className="col-span-2"><Field label="Filed by">{t.filedBy}</Field></div>
                </div>

                {t.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.labels.map((n) => { const l = LABELS.find((x) => x.name === n); return <span key={n} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: `${l?.color}66`, color: l?.color, background: `${l?.color}14` }}>{n}</span>; })}
                  </div>
                )}

                {t.checklist.length > 0 && (
                  <div>
                    <div className="eyebrow text-muted mb-1.5">Checklist</div>
                    {t.checklist.map((c, i) => (
                      <label key={i} className="flex items-center gap-2 text-[13px] py-0.5 cursor-pointer">
                        <input type="checkbox" checked={c.done} onChange={() => dispatch({ type: "update", id: t.id, patch: { checklist: t.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) } })} />
                        <span className={c.done ? "line-through text-muted" : "text-ink-2"}>{c.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {t.deliverable && (
                  <div>
                    <div className="eyebrow text-clay mb-1.5">Deliverable · {t.deliverable.title}</div>
                    <div className="rounded-md border border-line bg-soft/50 p-3"><Markdown>{t.deliverable.body}</Markdown></div>
                  </div>
                )}
                {t.escalation && (
                  <div>
                    <div className="eyebrow text-crit mb-1.5">Escalation note</div>
                    <pre className="text-[12.5px] font-mono text-ink-2 whitespace-pre-wrap leading-relaxed">{t.escalation}</pre>
                  </div>
                )}
                {t.holdQuestion && t.status !== "complete" && (
                  <div>
                    <div className="eyebrow text-warn mb-1.5">Hold — one question</div>
                    <div className="text-[13px] text-ink">{t.holdQuestion}</div>
                  </div>
                )}

                {/* completion */}
                {t.status === "complete" ? (
                  <div className="rounded-md border border-ok/30 bg-ok/[0.04] p-3">
                    <div className="text-[12px] text-ok font-medium mb-1">✓ Completed {t.completedBy ? `by ${person(t.completedBy)?.name}` : ""} {t.completedAt ? `· ${t.completedAt}` : ""}</div>
                    {t.completionNote && <pre className="text-[12.5px] font-mono text-ink-2 whitespace-pre-wrap leading-relaxed">{t.completionNote}</pre>}
                    <button onClick={() => dispatch({ type: "update", id: t.id, patch: { status: "outstanding", completionNote: undefined, completedBy: undefined, completedAt: undefined } })} className="mt-2 text-[12px] text-ink-2 hover:text-ink">Reopen</button>
                  </div>
                ) : (
                  <div className="rounded-md border border-line p-3">
                    <div className="eyebrow text-muted mb-1.5">Complete this task</div>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What was completed? (the note)" className="w-full bg-soft border border-line rounded-md px-2 py-1.5 text-[13px] text-ink outline-none resize-none mb-2" />
                    <button onClick={complete} className="text-[12.5px] bg-ok text-white px-3 py-1.5 rounded-md hover:opacity-90">Mark complete</button>
                  </div>
                )}

                {/* Run it with Claude — the honest manual flow */}
                <div className="rounded-md border border-clay/30 bg-clay/[0.03] p-3">
                  <div className="eyebrow text-clay mb-1.5">Run it with Claude</div>
                  <p className="text-[11.5px] text-muted mb-2">Copy the prompt → paste it into Claude → it does the work → paste the completion note above. (Or upload the whole client folder to the cloud to run them all.)</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={copyPrompt} className="text-[11.5px] font-medium bg-clay text-white rounded-md px-2.5 py-1 hover:opacity-90">{copied ? "Copied ✓" : "Copy prompt"}</button>
                    <ActBtn onClick={genPrompt}>Generate prompt</ActBtn>
                    {t.spaceSlug !== "executive" && <ActBtn onClick={routeExec}>Route to Executive ↑</ActBtn>}
                  </div>
                  {t.agentPrompt && <pre className="mt-2 text-[11px] font-mono text-ink-2 whitespace-pre-wrap leading-relaxed bg-soft/60 rounded p-2 max-h-32 overflow-y-auto">{t.agentPrompt}</pre>}
                </div>
              </>
            )}

            {tab === "conversation" && (
              <div className="space-y-3">
                {t.comments.length === 0 && <div className="text-[13px] text-muted">No comments yet. Start the thread.</div>}
                {t.comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar id={c.author === "client" ? null : c.author} size={24} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-medium text-ink">{c.author === "client" ? "Client" : person(c.author)?.name}</span>
                        <span className="text-[11px] text-muted">{c.at}</span>
                      </div>
                      <div className="text-[13px] text-ink-2 leading-relaxed whitespace-pre-wrap">{c.body}</div>
                      <button onClick={() => react(c.id)} className="mt-0.5 text-[11px] text-muted hover:text-ink">
                        {c.reactions?.find((r) => r.glyph === "❤️") ? `❤️ ${c.reactions.find((r) => r.glyph === "❤️")?.by.length}` : "♡ react"}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-1.5 pt-2 border-t border-line">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Comment…  @mention to hand off" className="flex-1 bg-soft border border-line rounded-md px-2.5 py-1.5 text-[13px] text-ink outline-none" />
                  <button onClick={() => setDraft((d) => d + "@sam ")} className="text-[12px] text-ink-2 border border-line rounded-md px-2 hover:text-ink">@</button>
                  <button onClick={send} className="text-[12.5px] bg-ink text-paper px-3 rounded-md">Send</button>
                </div>
              </div>
            )}

            {tab === "files" && (
              <div className="space-y-2">
                {t.deliverable ? (
                  <div className="rounded-md border border-line p-3">
                    <div className="font-mono text-[12px] text-ink mb-1">deliverables/{t.id}.md</div>
                    <Markdown>{t.deliverable.body}</Markdown>
                  </div>
                ) : (
                  <div className="text-[13px] text-muted">No files yet. Deliverables land here when the task is completed.</div>
                )}
              </div>
            )}

            {tab === "activity" && (
              <div className="border-l border-line pl-4 space-y-3 ml-1">
                <Act>Filed by {t.filedBy}</Act>
                {t.reason && <Act>Relay sorted it — {t.reason}</Act>}
                {t.comments.map((c) => <Act key={c.id}>{c.author === "client" ? "Client" : person(c.author)?.name} commented ({c.at})</Act>)}
                {t.escalation && <Act>Escalated to {person(t.assignee)?.name ?? "an operator"}</Act>}
                {t.status === "complete" && <Act>Completed by {person(t.completedBy)?.name ?? "—"} {t.completedAt}</Act>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MiniTab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`text-[11px] px-2 py-0.5 rounded ${on ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}>{children}</button>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-md border border-line px-2.5 py-1.5"><div className="text-[10px] uppercase tracking-wider text-muted mb-0.5">{label}</div><div className="text-ink-2">{children}</div></div>;
}
function ActBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button onClick={onClick} disabled={disabled} className="text-[11.5px] border border-line rounded-md px-2 py-1 text-ink-2 hover:text-ink hover:border-ink-2/50 disabled:opacity-50">{children}</button>;
}
function Act({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] text-ink-2 relative"><span className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 rounded-full bg-line" />{children}</div>;
}
