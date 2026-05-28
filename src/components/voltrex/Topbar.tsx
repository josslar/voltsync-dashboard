import { Menu, Activity, Bell } from "lucide-react";
import { useRouterState, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/devices": "Devices",
  "/predictions": "Predictions",
  "/history": "History",
  "/chatbot": "AI Assistant",
  "/payments": "Buy Units",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = TITLES[pathname] ?? "VOLTREX";
  const notifications = useAppStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="hidden sm:inline">Live telemetry</span>
            <Activity className="h-3.5 w-3.5 text-primary-glow" />
          </div>

          <Link
            to="/notifications"
            className="relative p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
