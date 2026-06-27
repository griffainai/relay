"use client";
import { useStore, View } from "@/lib/store";
import { RelayWordmark } from "../RelayMark";

type Nav = { view: View; label: string; hint: string };
const WORK: Nav[] = [
  { view: "board", label: "Board", hint: "tasks + console" },
  { view: "cockpit", label: "Cockpit", hint: "what needs you" },
  { view: "analytics", label: "Analytics", hint: "operations" },
  { view: "messages", label: "Messages", hint: "channels & DMs" },
  { view: "activity", label: "Activity", hint: "what we all did" },
];
const SYSTEM: Nav[] = [{ view: "brain", label: "The Brain", hint: "how it thinks" }];
const LOCKED: { label: string; key: string }[] = [
  { label: "Login & accounts", key: "login" },
  { label: "Multiple businesses", key: "businesses" },
  { label: "Calendar", key: "calendar" },
  { label: "Decisions", key: "decisions" },
  { label: "Costs", key: "costs" },
  { label: "Admin", key: "admin" },
];

// A client (Dana) sees a stripped portal — just her board + messages.
const CLIENT_VIEWS: View[] = ["board", "messages"];

export function Sidebar() {
  const { state, dispatch } = useStore();
  const isClient = state.role === "client";
  const work = isClient ? WORK.filter((v) => CLIENT_VIEWS.includes(v.view)) : WORK;

  const Item = ({ v }: { v: Nav }) => {
    const active = state.view === v.view;
    return (
      <button onClick={() => dispatch({ type: "view", view: v.view })} className={`w-full text-left px-2.5 py-1.5 rounded-md transition flex flex-col ${active ? "bg-soft" : "hover:bg-soft/60"}`}>
        <span className={`text-[13.5px] ${active ? "text-ink font-medium" : "text-ink-2"}`}>{v.label}</span>
        <span className="text-[11px] text-muted">{v.hint}</span>
      </button>
    );
  };

  return (
    <div className="w-[208px] shrink-0 border-r border-line bg-paper flex flex-col">
      <div className="px-3 py-3.5 border-b border-line"><RelayWordmark size={24} /></div>
      <div className="px-2 py-3 flex-1 overflow-y-auto">
        {isClient && (
          <div className="mx-2 mb-3 rounded-md border border-line bg-soft/60 px-2.5 py-2 text-[11px] text-muted">
            Client portal · you see only your own requests.
          </div>
        )}
        <div className="eyebrow text-muted px-2.5 mb-1.5">Work</div>
        <div className="space-y-0.5 mb-4">{work.map((v) => <Item key={v.view} v={v} />)}</div>
        {!isClient && (
          <>
            <div className="eyebrow text-muted px-2.5 mb-1.5">System</div>
            <div className="space-y-0.5 mb-4">{SYSTEM.map((v) => <Item key={v.view} v={v} />)}</div>
            <div className="eyebrow text-muted px-2.5 mb-1.5">In the full system</div>
            <div data-demo="locked" className="space-y-0.5">
              {LOCKED.map((l) => (
                <button key={l.key} onClick={() => dispatch({ type: "fullSystem", key: l.key })} className="w-full px-2.5 py-1.5 rounded-md flex items-center justify-between opacity-60 hover:opacity-100 hover:bg-soft/60 transition" title={`${l.label} — see what it does in the full system`}>
                  <span className="text-[13.5px] text-muted">{l.label}</span><span className="text-[10px] text-muted">🔒</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-line text-[11px] text-muted leading-relaxed">
        Powered by a 45-file ICM system
        <div className="text-[10px] mt-0.5 opacity-80">Relay™ · © 2026 · demo, evaluation only</div>
      </div>
    </div>
  );
}
