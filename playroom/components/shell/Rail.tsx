"use client";
import { RelayMark } from "../RelayMark";
import { useStore, accessibleSpaces } from "@/lib/store";
import { ThemeToggle } from "../ThemeToggle";

export function Rail() {
  const { state, dispatch } = useStore();
  const spaces = accessibleSpaces(state.role);
  const clients = spaces.filter((s) => s.kind === "client");
  const execs = spaces.filter((s) => s.kind === "executive");
  const showAll = state.role !== "client";

  const Tile = ({ slug, name, color, exec }: { slug: string; name: string; color?: string; exec?: boolean }) => {
    const active = state.activeSpace === slug;
    return (
      <button
        onClick={() => dispatch({ type: "space", slug })}
        title={name}
        className="w-9 h-9 rounded-md flex items-center justify-center text-[12px] font-semibold transition-all relative"
        style={{
          background: slug === "all" ? "transparent" : `${color}1f`,
          color: slug === "all" ? "var(--ink-2)" : color,
          boxShadow: active ? `0 0 0 2px var(--soft), 0 0 0 3.5px ${color ?? "var(--ink)"}` : undefined,
          opacity: active ? 1 : 0.8,
        }}
      >
        {slug === "all" ? "◎" : name.slice(0, 1)}
        {exec && <span className="absolute -top-1 -right-1 text-[8px]">♦</span>}
      </button>
    );
  };

  return (
    <div data-demo="rail" className="w-[60px] shrink-0 border-r border-line bg-soft flex flex-col items-center py-3 gap-1.5">
      <div className="text-ink mb-1"><RelayMark size={26} /></div>
      <div className="w-7 h-px bg-line my-1" />
      {showAll && <Tile slug="all" name="All" color="#000" />}
      {clients.length > 0 && <div className="text-[8px] uppercase tracking-wider text-muted mt-1.5">Cli</div>}
      {clients.map((s) => <Tile key={s.slug} slug={s.slug} name={s.name} color={s.color} />)}
      {execs.length > 0 && <div className="text-[8px] uppercase tracking-wider text-muted mt-1.5" title="Executive — founders only">Exec</div>}
      {execs.map((s) => <Tile key={s.slug} slug={s.slug} name={s.name} color={s.color} exec />)}
      <div className="mt-auto"><ThemeToggle /></div>
    </div>
  );
}
