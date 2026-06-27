"use client";

import React, { createContext, useContext, useReducer } from "react";
import { SEED_TASKS, SPACES } from "./studio";
import type { Comment, PersonId, Space, Task, TaskStatus } from "./types";

export type View = "board" | "cockpit" | "analytics" | "messages" | "activity" | "brain" | "admin" | "folder";
export type DetailTab = "details" | "conversation" | "files" | "activity";
export type Role = "exec" | "member" | "client";

interface State {
  role: Role;
  view: View;
  activeSpace: string; // slug | "all"
  activeChannel: string; // for messages view
  tasks: Task[];
  selected?: string;
  detailTab: DetailTab;
  fileMode: boolean;
  apiKey?: string;
  tour: number;
  cmdk: boolean;
  quickAdd: boolean;
  typing: PersonId | null;
  review: boolean;
  wall: boolean; // public reviews wall
  fullSystem: string | null; // which "in the full system" feature explainer is open
  clientTab: string; // client portal tab: overview|work|deliverables|files|goals|meetings|billing
}

type Action =
  | { type: "role"; role: Role }
  | { type: "view"; view: View }
  | { type: "space"; slug: string }
  | { type: "channel"; id: string }
  | { type: "select"; id?: string }
  | { type: "detailTab"; tab: DetailTab }
  | { type: "fileMode"; on: boolean }
  | { type: "key"; key?: string }
  | { type: "tour"; step: number }
  | { type: "cmdk"; on: boolean }
  | { type: "quickAdd"; on: boolean }
  | { type: "review"; on: boolean }
  | { type: "wall"; on: boolean }
  | { type: "fullSystem"; key: string | null }
  | { type: "clientTab"; tab: string }
  | { type: "typing"; who: PersonId | null }
  | { type: "add"; task: Task }
  | { type: "update"; id: string; patch: Partial<Task> }
  | { type: "comment"; id: string; comment: Comment }
  | { type: "status"; id: string; status: TaskStatus };

const initial: State = {
  role: "exec",
  view: "board",
  activeSpace: "all",
  activeChannel: "studio",
  tasks: SEED_TASKS,
  detailTab: "details",
  fileMode: false,
  tour: -1,
  cmdk: false,
  quickAdd: false,
  typing: null,
  review: false,
  wall: false,
  fullSystem: null,
  clientTab: "overview",
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "role": {
      // reset to a safe space for the new role
      const spaces = accessibleSpaceSlugs(a.role);
      const activeSpace = a.role === "client" ? spaces[0] : "all";
      return { ...s, role: a.role, activeSpace, selected: undefined, view: a.role === "client" ? "board" : s.view };
    }
    case "view":
      return { ...s, view: a.view };
    case "space": {
      // harden: never let a view set a space the role can't access
      const allow = accessibleSpaceSlugs(s.role);
      const ok = a.slug === "all" || allow.includes(a.slug);
      return { ...s, activeSpace: ok ? a.slug : s.activeSpace, selected: undefined };
    }
    case "channel":
      return { ...s, activeChannel: a.id };
    case "select":
      return { ...s, selected: a.id, detailTab: "details", fileMode: false };
    case "detailTab":
      return { ...s, detailTab: a.tab };
    case "fileMode":
      return { ...s, fileMode: a.on };
    case "key":
      return { ...s, apiKey: a.key };
    case "tour":
      return { ...s, tour: a.step };
    case "cmdk":
      return { ...s, cmdk: a.on };
    case "quickAdd":
      return { ...s, quickAdd: a.on };
    case "review":
      return { ...s, review: a.on };
    case "wall":
      return { ...s, wall: a.on };
    case "fullSystem":
      return { ...s, fullSystem: a.key };
    case "clientTab":
      return { ...s, clientTab: a.tab };
    case "typing":
      return { ...s, typing: a.who };
    case "add":
      return { ...s, tasks: [a.task, ...s.tasks], selected: a.task.id };
    case "update":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) };
    case "status":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, status: a.status } : t)) };
    case "comment":
      return { ...s, tasks: s.tasks.map((t) => (t.id === a.id ? { ...t, comments: [...t.comments, a.comment] } : t)) };
    default:
      return s;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

/** The access model, as a demo toggle (mirrors the real exec/member/external tiers). */
export function accessibleSpaceSlugs(role: Role): string[] {
  if (role === "exec") return SPACES.map((s) => s.slug);
  if (role === "member") return SPACES.filter((s) => s.kind === "client").map((s) => s.slug);
  return ["northwind"]; // "client" = Dana, sees only her own space
}
export function accessibleSpaces(role: Role): Space[] {
  const allow = new Set(accessibleSpaceSlugs(role));
  return SPACES.filter((s) => allow.has(s.slug));
}

export function visibleTasks(s: State): Task[] {
  const allow = new Set(accessibleSpaceSlugs(s.role));
  let t = s.tasks.filter((x) => allow.has(x.spaceSlug));
  if (s.activeSpace !== "all") t = t.filter((x) => x.spaceSlug === s.activeSpace);
  return t;
}
