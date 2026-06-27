"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { spaceBySlug, OPERATORS, person } from "@/lib/studio";
import { Avatar } from "../Avatar";
import { RoleSwitcher } from "../RoleSwitcher";

const VIEW_LABEL: Record<string, string> = { board: "Board", cockpit: "Cockpit", activity: "Activity", brain: "The Brain" };

export function TopBar() {
  const { state, dispatch } = useStore();
  const space = state.activeSpace === "all" ? null : spaceBySlug(state.activeSpace);
  const typingName = state.typing ? person(state.typing)?.name : null;
  const [viewers, setViewers] = useState(5);
  useEffect(() => {
    const iv = setInterval(() => setViewers((v) => Math.max(2, Math.min(11, v + (Math.random() < 0.5 ? -1 : 1)))), 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-[52px] shrink-0 border-b border-line bg-paper flex items-center px-4 gap-3">
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-muted">Relay</span><span className="text-muted">/</span>
        <span className="text-muted">{space ? space.name : "All"}</span><span className="text-muted">/</span>
        <span className="text-ink font-medium">{VIEW_LABEL[state.view]}</span>
      </div>

      <div className="ml-3 pl-3 border-l border-line"><RoleSwitcher /></div>

      {/* presence */}
      <div data-demo="presence" className="flex items-center gap-2 ml-3 pl-3 border-l border-line">
        <div className="flex -space-x-1.5">
          {OPERATORS.map((o) => <Avatar key={o.id} id={o.id} size={24} ring />)}
        </div>
        <span className="text-[11px] text-muted">
          {typingName ? (
            <span className="text-clay">{typingName === "Relay" ? "Relay is working…" : `${typingName} is typing…`}</span>
          ) : (
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />{viewers} viewing now</span>
          )}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button aria-label="Open command palette" onClick={() => dispatch({ type: "cmdk", on: true })} className="text-[12px] text-muted border border-line rounded-md px-2 py-1 hover:border-ink-2/50 font-mono">⌘K</button>
        <button onClick={() => dispatch({ type: "tour", step: 0 })} className="text-[12px] text-ink-2 border border-line rounded-md px-2.5 py-1 hover:border-ink-2/50">Tour</button>
      </div>
    </div>
  );
}
