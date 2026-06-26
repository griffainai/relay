"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { CHANNELS, CLIENT_CHANNELS, SEED_MESSAGES, AMBIENT, Msg } from "@/lib/chat";
import { Avatar } from "../Avatar";
import { person } from "@/lib/studio";
import { nextMsgId } from "@/lib/id";
import type { PersonId } from "@/lib/types";

export function MessagesView() {
  const { state, dispatch } = useStore();
  const isClient = state.role === "client";
  const viewer: PersonId | "client" = isClient ? "client" : state.role === "member" ? "shaq" : "jay";
  const channels = isClient ? CLIENT_CHANNELS : CHANNELS;
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>(() => JSON.parse(JSON.stringify(SEED_MESSAGES)));
  const [draft, setDraft] = useState("");
  const ch = channels.some((c) => c.id === state.activeChannel) ? state.activeChannel : channels[0].id;
  const list = msgs[ch] ?? [];

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => ({ ...m, [ch]: [...(m[ch] ?? []), { id: nextMsgId(), author: viewer, body: draft.trim(), at: "now" }] }));
    setDraft("");
  };
  const react = (id: string) => {
    setMsgs((m) => ({
      ...m,
      [ch]: (m[ch] ?? []).map((x) => {
        if (x.id !== id) return x;
        const r = x.reactions?.find((y) => y.glyph === "❤️");
        const has = r?.by.includes(viewer);
        const reactions = has
          ? (x.reactions ?? []).map((y) => (y.glyph === "❤️" ? { ...y, by: y.by.filter((b) => b !== viewer) } : y)).filter((y) => y.by.length)
          : [...(x.reactions ?? []).filter((y) => y.glyph !== "❤️"), { glyph: "❤️", by: [...(r?.by ?? []), viewer] }];
        return { ...x, reactions };
      }),
    }));
  };

  // simulated demo visitors dripping into the lounge (no backend)
  const dripped = useRef(0);
  useEffect(() => {
    if (ch !== "lounge") return;
    const iv = setInterval(() => {
      if (dripped.current >= AMBIENT.length) { clearInterval(iv); return; }
      const a = AMBIENT[dripped.current++];
      setMsgs((m) => ({ ...m, lounge: [...(m.lounge ?? []), { id: nextMsgId(), author: "guest", guestName: a.guestName, body: a.body, at: "now" }] }));
    }, 6500);
    return () => clearInterval(iv);
  }, [ch]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[180px] shrink-0 border-r border-line p-2">
        <div className="eyebrow text-muted px-2 mb-1.5">Channels</div>
        {channels.map((c) => (
          <button key={c.id} onClick={() => dispatch({ type: "channel", id: c.id })} className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] ${ch === c.id ? "bg-soft text-ink font-medium" : "text-ink-2 hover:bg-soft/60"}`}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[44px] shrink-0 border-b border-line flex items-center px-4 text-[13px] font-medium text-ink">
          {channels.find((c) => c.id === ch)?.name}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {list.map((m) => (
            <div key={m.id} className="flex gap-2.5">
              {m.guestName ? (
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0" style={{ background: "#76767B" }}>{m.guestName[0]}</span>
              ) : (
                <Avatar id={(m.author === "client" || m.author === "guest" ? null : m.author) as any} size={28} ring />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-ink">{m.guestName ?? (m.author === "client" ? "Client" : person(m.author as any)?.name)}</span>
                  {m.guestName && <span className="text-[9px] uppercase tracking-wider text-muted border border-line rounded px-1">guest</span>}
                  {person(m.author as any)?.isAgent && <span className="text-[9px] uppercase tracking-wider text-clay border border-clay/40 rounded px-1">AI</span>}
                  <span className="text-[11px] text-muted">{m.at}</span>
                </div>
                <div className="text-[13.5px] text-ink-2 leading-relaxed whitespace-pre-wrap">{m.body}</div>
                <button onClick={() => react(m.id)} className="mt-0.5 text-[11px] text-muted hover:text-ink">
                  {m.reactions?.find((r) => r.glyph === "❤️") ? `❤️ ${m.reactions.find((r) => r.glyph === "❤️")?.by.length}` : "♡"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-3">
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…  (try /task, /remind, @mention)" className="flex-1 bg-soft border border-line rounded-md px-3 py-2 text-[13.5px] text-ink outline-none" />
            <button onClick={send} className="px-3.5 py-2 rounded-md bg-ink text-paper text-[13px] font-medium">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
