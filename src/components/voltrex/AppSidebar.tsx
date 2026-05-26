import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  Sparkles,
  History,
  Bell,
  Settings,
  Zap,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/lib/i18n";
import { useAppStore } from "@/store/app";

export function AppSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border">
        <SidebarBody />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col lg:hidden"
            >
              <button
                onClick={onCloseMobile}
                className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-sidebar-accent transition"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarBody onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const email = useAuth((s) => s.email);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  const lang = useAppStore((s) => s.language);
  const t = useTranslation(lang);

  const items = [
    { to: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/devices", label: t("devices"), icon: Cpu },
    { to: "/predictions", label: t("predictions"), icon: Sparkles },
    { to: "/history", label: t("history"), icon: History },
    { to: "/notifications", label: t("notifications"), icon: Bell },
    { to: "/settings", label: t("settings"), icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight text-glow">VOLTREX</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Grid Console
          </div>
        </div>
      </div>

      <nav className="px-3 mt-2 flex-1 space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className="relative block"
            >
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-sidebar-accent border border-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className={`h-4 w-4 relative ${active ? "text-primary-glow" : ""}`} />
                <span className="relative">{it.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-sm font-semibold">
            {email?.[0]?.toUpperCase() ?? "V"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{email}</div>
            <div className="text-[10px] text-muted-foreground">{t("operator")}</div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="p-2 rounded-md hover:bg-sidebar-accent transition text-muted-foreground hover:text-foreground"
            aria-label={t("logout")}
            title={t("logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
