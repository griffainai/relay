"use client";
import { useEffect } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { Rail } from "./shell/Rail";
import { Sidebar } from "./shell/Sidebar";
import { TopBar } from "./shell/TopBar";
import { BoardView } from "./views/BoardView";
import { CockpitView } from "./views/CockpitView";
import { AnalyticsView } from "./views/AnalyticsView";
import { MessagesView } from "./views/MessagesView";
import { ActivityView } from "./views/ActivityView";
import { BrainView } from "./views/BrainView";
import { Tour } from "./Tour";
import { CommandK } from "./CommandK";
import { QuickAdd } from "./QuickAdd";
import { ClientPortal } from "./ClientPortal";
import { AutoDemo } from "./AutoDemo";
import { Chatbot } from "./Chatbot";
import { ReviewModal } from "./ReviewModal";
import { FullSystemModal } from "./FullSystemModal";

function Workspace() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch({ type: "quickAdd", on: !state.quickAdd });
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch({ type: "cmdk", on: !state.cmdk });
      } else if (e.key === "Escape") {
        if (state.cmdk) dispatch({ type: "cmdk", on: false });
        else if (state.tour >= 0) dispatch({ type: "tour", step: -1 });
        else if (state.selected) dispatch({ type: "select", id: undefined });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.cmdk, state.quickAdd, state.tour, state.selected, dispatch]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-paper text-ink">
      <Rail />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 min-h-0">
          {state.view === "board" && <BoardView />}
          {state.view === "cockpit" && <CockpitView />}
          {state.view === "analytics" && <AnalyticsView />}
          {state.view === "messages" && <MessagesView />}
          {state.view === "activity" && <ActivityView />}
          {state.view === "brain" && <BrainView />}
        </div>
      </div>
      <Tour />
      <CommandK />
      <QuickAdd />
    </div>
  );
}

function Root() {
  const { state, dispatch } = useStore();
  // invite a review after the visitor has had time to explore
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: "review", on: true }), 300000);
    return () => clearTimeout(t);
  }, [dispatch]);
  return (
    <>
      {state.role === "client" ? <ClientPortal /> : <Workspace />}
      <AutoDemo />
      <Chatbot />
      <ReviewModal />
      <FullSystemModal />
    </>
  );
}

export default function Playroom() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}
