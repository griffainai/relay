"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { RelayWordmark } from "./RelayMark";
import { RoleSwitcher } from "./RoleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { spaceBySlug } from "@/lib/studio";
import { nextTaskId } from "@/lib/id";
import type { Task } from "@/lib/types";

// What a client (Dana) is allowed to see — request + status only.
// Never: lanes, Run tasks, completion controls, AI actions, escalations,
// internal comments, other clients, or the executive space.
const CLIENT_SLUG = "northwind";

function clientStatus(t: Task): { label: string; color: string } {
  if (t.status === "complete") return { label: "Done", color: "var(--ok)" };
  if (t.holdQuestion) return { label: "Needs your input", color: "var(--warn)" };
  if (t.status === "in-progress") return { label: "In progress", color: "var(--clay)" };
  return { label: "Received", color: "var(--muted)" }; // escalations look like "in progress" to the client
}

export function ClientPortal() {
  const { state, dispatch } = useStore();
  const space = spaceBySlug(CLIENT_SLUG)!;
  const [text, setText] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const mine = state.tasks.filter((t) => t.spaceSlug === CLIENT_SLUG && t.origin === "client");

  const submit = () => {
    if (!text.trim()) return;
    const task: Task = {
      id: nextTaskId(),
      spaceSlug: CLIENT_SLUG,
      title: text.trim().slice(0, 60),
      description: text.trim(),
      priority: "p2",
      status: "outstanding",
      assignee: null,
      labels: [],
      checklist: [],
      origin: "client",
      filedBy: "client (Dana)",
      comments: [],
    };
    dispatch({ type: "add", task });
    dispatch({ type: "select", id: undefined });
    setText("");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-paper text-ink">
      {/* slim brand bar — note the View-as stays so judges can switch back */}
      <div className="h-[52px] shrink-0 border-b border-line flex items-center px-4 gap-3">
        <RelayWordmark size={24} />
        <span className="text-[12px] text-muted ml-1">· {space.name} client portal</span>
        <div className="ml-auto flex items-center gap-3"><RoleSwitcher /><ThemeToggle /></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h1 className="text-[26px] font-light tracking-tight mb-1">Hi Dana — what do you need?</h1>
          <p className="text-[13.5px] text-muted mb-5">Ask in plain language. No login, no project tool. We'll handle it and you'll see the status right here.</p>

          <div className="rounded-lg border border-line bg-paper p-3 shadow-sm mb-8">
            <textarea
              data-demo="client-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="e.g. Can you update the homepage headline to mention same-day quotes?"
              className="w-full bg-soft border border-line rounded-md px-3 py-2.5 text-[14px] text-ink outline-none resize-none mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted">Northwind · retainer</span>
              <button onClick={submit} disabled={!text.trim()} className="text-[13px] font-medium bg-ink text-paper px-4 py-2 rounded-md disabled:opacity-40">Send request</button>
            </div>
          </div>

          <div className="eyebrow text-muted mb-3">Your requests</div>
          <div className="space-y-2">
            {mine.map((t) => {
              const st = clientStatus(t);
              const isOpen = open === t.id;
              return (
                <div key={t.id} className="rounded-lg border border-line bg-paper overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : t.id)} className="w-full text-left px-4 py-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: st.color }} />
                    <span className="text-[13.5px] text-ink flex-1">{t.title}</span>
                    <span className="text-[11.5px]" style={{ color: st.color }}>{st.label}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-0 border-t border-line space-y-2">
                      <div className="text-[12.5px] text-ink-2 leading-relaxed">"{t.description}"</div>
                      {t.holdQuestion && (
                        <div className="rounded-md bg-warn/[0.06] border border-warn/30 px-3 py-2 text-[12.5px] text-ink">
                          <span className="font-medium">We need one thing:</span> {t.holdQuestion}
                        </div>
                      )}
                      {t.status === "complete" && (
                        <div className="rounded-md bg-ok/[0.05] border border-ok/30 px-3 py-2 text-[12.5px] text-ink-2">
                          <span className="font-medium text-ok">Done.</span> {t.deliverable ? "Your update is ready for review." : "Completed."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {mine.length === 0 && <div className="text-[13px] text-muted">No requests yet — send your first above.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
