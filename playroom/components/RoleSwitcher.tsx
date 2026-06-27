"use client";
import { useStore, Role } from "@/lib/store";
import { activeSpaces } from "@/lib/datasets";

export function RoleSwitcher() {
  const { state, dispatch } = useStore();
  const clientName = activeSpaces().find((s) => s.kind === "client")?.name ?? "external";
  const clientLabel = state.dataset === "studio" ? "Client (Dana)" : `Client (${clientName})`;
  const ROLES: { role: Role; label: string; sub: string }[] = [
    { role: "exec", label: "Executive (Alex)", sub: "sees everything, incl. Executive" },
    { role: "member", label: "Member (Sam)", sub: "client spaces only" },
    { role: "client", label: clientLabel, sub: "their own requests only" },
  ];
  const cur = ROLES.find((r) => r.role === state.role)!;
  return (
    <label className="flex items-center gap-1.5 text-[12px]" title={cur.sub}>
      <span className="text-muted">View as</span>
      <select
        data-demo="role"
        value={state.role}
        onChange={(e) => dispatch({ type: "role", role: e.target.value as Role })}
        className="bg-soft border border-line rounded-md px-2 py-1 text-ink outline-none cursor-pointer"
      >
        {ROLES.map((r) => (
          <option key={r.role} value={r.role}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
