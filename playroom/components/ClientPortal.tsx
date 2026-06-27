"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { RelayWordmark } from "./RelayMark";
import { RoleSwitcher } from "./RoleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { TaskCard } from "./TaskCard";
import { Avatar } from "./Avatar";
import { Markdown } from "./Markdown";
import { person } from "@/lib/studio";
import { engagementFor, spaceBySlug, activeSpaces } from "@/lib/datasets";
import { nextTaskId, nextCommentId } from "@/lib/id";
import { PHASES } from "@/lib/types";
import type { EngFile, EngMeeting, Task } from "@/lib/types";

const DEFAULT_CLIENT = "northwind";
const TABS = ["overview", "board", "deliverables", "files", "goals", "meetings", "billing"] as const;

// the client's 3 simple lanes (scoped, friendly)
const LANES: { key: string; label: string; has: (t: Task) => boolean }[] = [
  { key: "open", label: "Open", has: (t) => t.status === "outstanding" || t.status === "waiting-on" || t.status === "needs-review" },
  { key: "prog", label: "In progress", has: (t) => t.status === "in-progress" },
  { key: "done", label: "Done", has: (t) => t.status === "complete" },
];

export function ClientPortal() {
  const { state, dispatch } = useStore();
  const activeSp = spaceBySlug(state.activeSpace);
  const clientSlug = activeSp && activeSp.kind === "client" ? state.activeSpace : (activeSpaces().find((s) => s.kind === "client")?.slug ?? DEFAULT_CLIENT);
  const space = spaceBySlug(clientSlug)!;
  const eng = engagementFor(clientSlug)!;
  const tab = state.clientTab;
  const setTab = (t: string) => { dispatch({ type: "clientTab", tab: t }); dispatch({ type: "select", id: undefined }); };

  const [reqText, setReqText] = useState("");
  const [acks, setAcks] = useState<Record<string, string>>(() => Object.fromEntries(eng.deliverables.map((d) => [d.id, d.ack])));
  const [meetings, setMeetings] = useState<EngMeeting[]>(eng.meetings);
  const [files, setFiles] = useState<EngFile[]>(eng.files);
  const mine = state.tasks.filter((t) => t.spaceSlug === clientSlug && t.origin === "client");
  const selected = state.tasks.find((t) => t.id === state.selected && t.spaceSlug === clientSlug);

  const submit = () => {
    if (!reqText.trim()) return;
    const task: Task = { id: nextTaskId(), spaceSlug: clientSlug, title: reqText.trim().slice(0, 60), description: reqText.trim(), priority: "p2", status: "outstanding", assignee: null, labels: [], checklist: [], origin: "client", filedBy: state.dataset === "studio" ? "client (Dana)" : "client", comments: [] };
    dispatch({ type: "add", task });
    dispatch({ type: "select", id: task.id });
    setReqText("");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-paper text-ink">
      <div className="h-[52px] shrink-0 border-b border-line flex items-center px-4 gap-3">
        <RelayWordmark size={24} />
        <span className="text-[12px] text-muted ml-1">· {space.name} client portal</span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-clay/40 text-clay bg-clay/10 ml-1">{eng.tier}</span>
        <div className="ml-auto flex items-center gap-3"><RoleSwitcher /><ThemeToggle /></div>
      </div>

      <div className="h-11 shrink-0 border-b border-line flex items-center px-4 gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-[13px] px-3 py-1.5 rounded-md capitalize whitespace-nowrap ${tab === t ? "bg-soft text-ink font-medium" : "text-ink-2 hover:text-ink"}`}>{t}</button>
        ))}
      </div>

      <div data-demo="portal" className="flex-1 overflow-y-auto">
        <div className={tab === "board" ? "px-5 py-5" : "max-w-3xl mx-auto px-6 py-7"}>
          {tab === "overview" && <Overview eng={eng} />}
          {tab === "board" && <BoardTab eng={eng} mine={mine} reqText={reqText} setReqText={setReqText} submit={submit} onOpen={(id: string) => dispatch({ type: "select", id })} selectedId={state.selected} />}
          {tab === "deliverables" && <Deliverables eng={eng} acks={acks} setAcks={setAcks} />}
          {tab === "files" && <Files files={files} setFiles={setFiles} />}
          {tab === "goals" && <Goals eng={eng} />}
          {tab === "meetings" && <Meetings meetings={meetings} setMeetings={setMeetings} />}
          {tab === "billing" && <Billing eng={eng} />}
        </div>
      </div>

      {selected && <ClientTaskDetail t={selected} onClose={() => dispatch({ type: "select", id: undefined })} onReply={(body) => dispatch({ type: "comment", id: selected.id, comment: { id: nextCommentId(), author: "client", body, at: "now" } })} onAct={(verb) => { dispatch({ type: "comment", id: selected.id, comment: { id: nextCommentId(), author: "client", body: verb === "approve" ? "✓ Approved — looks great, thank you!" : "↩ A couple of changes, see the thread.", at: "now" } }); if (verb === "changes") dispatch({ type: "update", id: selected.id, patch: { status: "in-progress" } }); }} />}
    </div>
  );
}

// ── tabs ──
function PhaseBar({ phase }: { phase: string }) {
  const idx = PHASES.indexOf(phase as any);
  return (
    <div className="flex items-center gap-1.5">
      {PHASES.map((p, i) => (
        <div key={p} className="flex-1">
          <div className="h-1.5 rounded-full" style={{ background: i <= idx ? "var(--clay)" : "var(--line)" }} />
          <div className={`text-[9px] mt-1 capitalize ${i === idx ? "text-clay font-medium" : "text-muted"}`}>{p}</div>
        </div>
      ))}
    </div>
  );
}

function Overview({ eng }: any) {
  return (
    <div className="space-y-6">
      <div><h1 className="text-[26px] font-light tracking-tight mb-1">Hi Dana — here's where we are.</h1><p className="text-[13.5px] text-muted">Your engagement with the studio, start to finish.</p></div>
      <div className="rounded-lg border border-line bg-paper p-4"><div className="eyebrow text-muted mb-2.5">Delivery phase</div><PhaseBar phase={eng.phase} /><div className="text-[12px] text-muted mt-3">Status: <span className="text-ink-2">{eng.status}</span> · started {eng.startedAt}</div></div>
      <div className="grid grid-cols-3 gap-3"><Stat label="Next meeting" value={eng.nextMeeting ?? "—"} /><Stat label="Next invoice" value={eng.nextInvoice ?? "—"} /><Stat label="Plan" value={eng.tier} /></div>
    </div>
  );
}

function BoardTab({ eng, mine, reqText, setReqText, submit, onOpen, selectedId }: any) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div><h2 className="text-[20px] font-light tracking-tight">Your board</h2><p className="text-[12.5px] text-muted">Open any request to see status and reply to the studio.</p></div>
        {eng.scope && (
          <div className="ml-auto rounded-lg border border-line bg-paper p-3 min-w-[260px]">
            <div className="eyebrow text-muted mb-2">This month's scope</div>
            {eng.scope.map((s: any) => (
              <div key={s.label} className="flex items-center gap-2 mb-1.5"><span className="text-[11.5px] text-ink-2 w-24 shrink-0">{s.label}</span><div className="flex-1 h-2 rounded-full bg-soft overflow-hidden"><div className="h-full bg-clay rounded-full" style={{ width: `${(s.used / s.total) * 100}%` }} /></div><span className="text-[10.5px] text-muted">{s.used}/{s.total}</span></div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-line bg-paper p-3 max-w-2xl">
        <div className="flex gap-2">
          <input value={reqText} onChange={(e) => setReqText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Ask for something in plain language…" className="flex-1 bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none" />
          <button onClick={submit} disabled={!reqText.trim()} className="text-[13px] bg-ink text-paper px-4 py-2 rounded-md disabled:opacity-40">Send request</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {LANES.map((lane) => {
          const items = mine.filter(lane.has);
          return (
            <div key={lane.key}>
              <div className="text-[12px] font-medium text-ink-2 mb-2 px-1">{lane.label} <span className="text-muted">{items.length}</span></div>
              <div className="space-y-2.5">
                {items.map((t: Task) => <TaskCard key={t.id} t={t} active={selectedId === t.id} onClick={() => onOpen(t.id)} />)}
                {items.length === 0 && <div className="text-[11px] text-muted px-1">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Deliverables({ eng, acks, setAcks }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-light tracking-tight">Deliverables</h2>
      <p className="text-[12.5px] text-muted">Review the work and approve it — or send it back with a note.</p>
      {eng.deliverables.map((d: any) => { const a = acks[d.id]; return (
        <div key={d.id} className="rounded-lg border border-line bg-paper p-3.5">
          <div className="flex items-center gap-2 mb-1"><span className="text-[13.5px] text-ink font-medium flex-1">{d.title}</span><span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-line text-muted bg-soft">{d.status}</span></div>
          {d.isc && <div className="text-[11.5px] text-muted mb-2">Closes: “{d.isc}”</div>}
          {a === "approved" ? <span className="text-[12px] text-ok">✓ Approved</span> : a === "changes" ? <span className="text-[12px] text-warn">↩ Changes requested</span> : (
            <div className="flex gap-2"><button onClick={() => setAcks((x: any) => ({ ...x, [d.id]: "approved" }))} className="text-[12px] bg-ok text-white px-3 py-1 rounded-md">Approve</button><button onClick={() => setAcks((x: any) => ({ ...x, [d.id]: "changes" }))} className="text-[12px] border border-line text-ink-2 px-3 py-1 rounded-md hover:text-ink">Request changes</button></div>
          )}
        </div>
      ); })}
    </div>
  );
}

function Files({ files, setFiles }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center"><h2 className="text-[20px] font-light tracking-tight">Files</h2><button onClick={() => setFiles((f: EngFile[]) => [{ name: `upload-${f.length + 1}.pdf`, kind: "upload", from: "client" }, ...f])} className="ml-auto text-[12px] bg-ink text-paper px-3 py-1.5 rounded-md">+ Upload</button></div>
      <div className="space-y-1.5">{files.map((f: EngFile, i: number) => (<div key={i} className="flex items-center gap-3 rounded-md border border-line bg-paper px-3 py-2"><span className="text-[12px] font-mono text-muted">{f.kind}</span><span className="text-[13px] text-ink flex-1">{f.name}</span><span className="text-[11px] text-muted">from {f.from}</span><span className="text-[12px] text-clay">Download</span></div>))}</div>
      <p className="text-[11px] text-muted">Every deliverable and asset lives here — you own them.</p>
    </div>
  );
}

function Goals({ eng }: any) {
  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-light tracking-tight">Goals</h2>
      <div className="rounded-lg border border-line bg-paper p-4 space-y-2.5">
        <Field label="The problem" v={eng.isa.problem} /><Field label="The vision" v={eng.isa.vision} /><Field label="The goal" v={eng.isa.goal} />
        <div><div className="text-[11px] uppercase tracking-wider text-muted mb-1">Guardrails</div><ul className="text-[13px] text-ink-2 space-y-0.5">{eng.isa.constraints.map((c: string, i: number) => <li key={i} className="list-disc ml-4">{c}</li>)}</ul></div>
      </div>
      <div><div className="eyebrow text-muted mb-2">Targets</div><div className="space-y-2.5">{eng.targets.map((t: any) => (<div key={t.label}><div className="flex justify-between text-[12.5px] mb-1"><span className="text-ink-2">{t.label}</span><span className="text-ink font-medium">{t.pct}%</span></div><div className="h-2 rounded-full bg-soft overflow-hidden"><div className="h-full rounded-full bg-clay" style={{ width: `${t.pct}%` }} /></div></div>))}</div></div>
    </div>
  );
}

function Meetings({ meetings, setMeetings }: any) {
  const [booked, setBooked] = useState(false);
  const book = () => { setMeetings((m: EngMeeting[]) => [{ title: "New meeting with the studio", when: "Fri 10:00am", link: "meet.google.com/relay-demo", kind: "booked" }, ...m]); setBooked(true); setTimeout(() => setBooked(false), 1600); };
  return (
    <div className="space-y-4">
      <div className="flex items-center"><h2 className="text-[20px] font-light tracking-tight">Meetings</h2><button onClick={book} className="ml-auto text-[12px] bg-ink text-paper px-3 py-1.5 rounded-md">{booked ? "✓ Booked" : "Book a time"}</button></div>
      <div className="space-y-1.5">{meetings.map((m: EngMeeting, i: number) => (<div key={i} className="flex items-center gap-3 rounded-md border border-line bg-paper px-3 py-2.5"><div className="flex-1"><div className="text-[13.5px] text-ink">{m.title}</div><div className="text-[11.5px] text-muted">{m.when}</div></div><span className="text-[12px] text-clay">Join (Meet)</span></div>))}</div>
      <p className="text-[11px] text-muted">Booking creates a real Google Calendar event with a Meet link for both sides (full system: Google Calendar API).</p>
    </div>
  );
}

function Billing({ eng }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-light tracking-tight">Billing</h2>
      <div className="grid grid-cols-2 gap-3"><Stat label="Plan" value={eng.tier} /><Stat label="Recurring" value={eng.mrr ? `$${eng.mrr}/mo` : "—"} /></div>
      <div className="rounded-lg border border-line bg-paper divide-y divide-line">{eng.invoices.map((inv: any, i: number) => (<div key={i} className="flex items-center gap-3 px-3.5 py-2.5"><span className="text-[13px] text-ink flex-1">{inv.label}</span><span className="text-[12.5px] text-ink-2">${inv.amount}</span><span className="text-[11px] w-16 text-right" style={{ color: inv.status === "paid" ? "var(--ok)" : "var(--warn)" }}>{inv.status}</span><span className="text-[11px] text-muted w-14 text-right">{inv.date}</span></div>))}</div>
      <p className="text-[11px] text-muted">Powered by Stripe in the full system — payment links, subscriptions, and an immutable ledger.</p>
    </div>
  );
}

// ── client task detail (see request + reply + approve) ──
function ClientTaskDetail({ t, onClose, onReply, onAct }: { t: Task; onClose: () => void; onReply: (b: string) => void; onAct: (v: "approve" | "changes") => void }) {
  const [draft, setDraft] = useState("");
  const send = () => { if (!draft.trim()) return; onReply(draft.trim()); setDraft(""); };
  const st = t.status === "complete" ? { label: "Done", c: "var(--ok)" } : t.holdQuestion ? { label: "Needs your input", c: "var(--warn)" } : t.status === "in-progress" ? { label: "In progress", c: "var(--clay)" } : { label: "Received", c: "var(--muted)" };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative w-[520px] max-w-[94vw] max-h-[86vh] rounded-xl border border-line bg-paper shadow-xl flex flex-col animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 h-12 border-b border-line shrink-0">
          <span className="font-mono text-[11px] text-muted">{t.id}</span>
          <span className="inline-flex items-center gap-1.5 text-[12px]"><span className="w-1.5 h-1.5 rounded-full" style={{ background: st.c }} />{st.label}</span>
          <button onClick={onClose} aria-label="Close" className="ml-auto text-muted hover:text-ink text-[16px]">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div><div className="eyebrow text-muted mb-1">Your request</div><div className="text-[13.5px] text-ink leading-relaxed border-l-2 border-line pl-3 italic">{t.description}</div></div>
          {t.holdQuestion && t.status !== "complete" && <div className="rounded-md bg-warn/[0.06] border border-warn/30 px-3 py-2 text-[12.5px] text-ink"><span className="font-medium">The studio needs one thing:</span> {t.holdQuestion}</div>}
          {t.deliverable && (
            <div>
              <div className="eyebrow text-clay mb-1.5">Deliverable — review it</div>
              <div className="rounded-md border border-line bg-soft/50 p-3 mb-2"><Markdown>{t.deliverable.body}</Markdown></div>
              <div className="flex gap-2"><button onClick={() => onAct("approve")} className="text-[12px] bg-ok text-white px-3 py-1.5 rounded-md">Approve</button><button onClick={() => onAct("changes")} className="text-[12px] border border-line text-ink-2 px-3 py-1.5 rounded-md hover:text-ink">Request changes</button></div>
            </div>
          )}
          <div>
            <div className="eyebrow text-muted mb-2">Conversation</div>
            <div className="space-y-2.5">
              {t.comments.length === 0 && <div className="text-[12.5px] text-muted">No messages yet — say hi to the studio.</div>}
              {t.comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar id={c.author === "client" ? null : (c.author as any)} size={22} />
                  <div className="flex-1"><div className="flex items-center gap-2"><span className="text-[12px] font-medium text-ink">{c.author === "client" ? "You" : person(c.author as any)?.name}</span><span className="text-[11px] text-muted">{c.at}</span></div><div className="text-[13px] text-ink-2 leading-relaxed">{c.body}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line p-3 flex gap-2 shrink-0">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply to the studio…" className="flex-1 bg-soft border border-line rounded-md px-3 py-2 text-[13px] text-ink outline-none" />
          <button onClick={send} className="text-[13px] bg-ink text-paper px-3.5 rounded-md">Send</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-line bg-paper p-3"><div className="text-[11px] uppercase tracking-wider text-muted mb-1">{label}</div><div className="text-[13px] text-ink">{value}</div></div>; }
function Field({ label, v }: { label: string; v: string }) { return <div><div className="text-[11px] uppercase tracking-wider text-muted mb-0.5">{label}</div><div className="text-[13.5px] text-ink-2 leading-relaxed">{v}</div></div>; }
