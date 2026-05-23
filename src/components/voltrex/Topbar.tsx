import { Menu, Activity } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/devices": "Devices",
  "/predictions": "Predictions",
  "/history": "History",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = TITLES[pathname] ?? "VOLTREX";

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="flex items-center gap-3 px-4 sm:px-8 h-16 max-w-[1400px] w-full mx-auto">
        <button
          onClick={onMenu}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-secondary transition"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="hidden sm:inline">Live telemetry</span>
          <Activity className="h-3.5 w-3.5 text-primary-glow" />
        </div>
      </div>
    </header>
  );
}
