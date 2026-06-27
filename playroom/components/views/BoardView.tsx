"use client";
import { useStore, visibleTasks } from "@/lib/store";
import { Console } from "../Console";
import { TaskCard } from "../TaskCard";
import { TaskPanel } from "../TaskPanel";
import { STATUS_LANES } from "@/lib/board";
import { spaceBySlug } from "@/lib/datasets";

export function BoardView() {
  const { state, dispatch } = useStore();
  const tasks = visibleTasks(state);
  const selected = state.tasks.find((t) => t.id === state.selected);
  const space = state.activeSpace === "all" ? null : spaceBySlug(state.activeSpace);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {space && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: space.color }} />
            <span className="text-[14px] font-medium text-ink">{space.name}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-line text-muted capitalize">{space.classification}</span>
            <span className="text-[12px] text-muted">· {space.frame}</span>
          </div>
        )}
        <div className="p-4 pb-0">
          <Console />
        </div>
        <div className="flex-1 overflow-x-auto p-4">
          <div data-demo="board" className="grid grid-cols-5 gap-3 h-full min-w-[860px]">
            {STATUS_LANES.map((lane) => {
              const items = tasks.filter((t) => t.status === lane.status);
              return (
                <div key={lane.status} className="flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: lane.dot }} />
                    <span className="text-[12px] font-medium text-ink-2">{lane.label}</span>
                    <span className="text-[11px] text-muted ml-auto">{items.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pt-1">
                    {items.map((t) => (
                      <TaskCard key={t.id} t={t} active={state.selected === t.id} onClick={() => dispatch({ type: "select", id: t.id })} />
                    ))}
                    {items.length === 0 && <div className="text-[11px] text-muted px-1 py-2">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selected && <TaskPanel t={selected} />}
    </div>
  );
}
