"use client";
import { useEffect, useRef, useState } from "react";
import { useStore, accessibleSpaces } from "@/lib/store";
import type { Priority, Task } from "@/lib/types";

let counter = 700;

export function QuickAdd() {
  const { state, dispatch } = useStore();
  const [text, setText] = useState("");
  const [slug, setSlug] = useState("northwind");
  const [priority, setPriority] = useState<Priority>("p2");
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const spaces = accessibleSpaces(state.role).filter((s) => s.kind === "client" || state.role === "exec");
  const effSlug = spaces.some((s) => s.slug === slug) ? slug : (spaces[0]?.slug ?? slug); // stay valid across datasets

  useEffect(() => {
    if (state.quickAdd) {
      setText("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [state.quickAdd]);

  if (!state.quickAdd) return null;
  const close = () => dispatch({ type: "quickAdd", on: false });

  const submit = () => {
    if (!text.trim()) return;
    const task: Task = {
      id: `t-${++counter}`,
      spaceSlug: effSlug,
      projectName: "Captured",
      title: text.trim().slice(0, 60),
      description: text.trim(),
      priority,
      status: "outstanding",
      assignee: null,
      labels: [],
      checklist: [],
      origin: "operator",
      filedBy: "quick-capture",
      comments: [],
    };
    dispatch({ type: "add", task });
    setText("");
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[20vh]" onClick={close}>
      <div className="absolute inset-0 bg-ink/30" />
      <div className="relative w-[480px] max-w-[92vw] rounded-xl border border-line bg-paper shadow-xl p-4 animate-lane-in" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow text-clay mb-2">Quick capture</div>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") close(); }}
          placeholder="Capture a task… (Enter to add, keeps open)"
          className="w-full bg-soft border border-line rounded-md px-3 py-2.5 text-[14px] text-ink outline-none mb-2"
        />
        <div className="flex items-center gap-2">
          <select value={effSlug} onChange={(e) => setSlug(e.target.value)} className="bg-soft border border-line rounded-md px-2 py-1.5 text-[12.5px] text-ink-2 outline-none">
            {spaces.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="bg-soft border border-line rounded-md px-2 py-1.5 text-[12.5px] text-ink-2 outline-none">
            <option value="p0">High</option><option value="p1">Med</option><option value="p2">Normal</option><option value="p3">Low</option>
          </select>
          <button onClick={submit} className="ml-auto text-[12.5px] bg-ink text-paper px-3 py-1.5 rounded-md">Capture</button>
          {flash && <span className="text-[12px] text-ok">✓ captured</span>}
        </div>
      </div>
    </div>
  );
}
