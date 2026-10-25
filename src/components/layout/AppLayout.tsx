import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  BrainCircuit,
  Stethoscope,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldPlus,
  ChevronRight,
  History,
  Lock,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { getUser, clearUser, getInitials } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Network, label: "Hospitals", to: "/nodes" },
  { icon: BrainCircuit, label: "Models", to: "/models" },
  { icon: Lock, label: "Privacy", to: "/privacy" },
  { icon: Stethoscope, label: "Risk check", to: "/predict" },
  { icon: History, label: "History", to: "/predictions" },
  { icon: BookOpen, label: "How it works", to: "/how-it-works" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { loading } = useAuth(true);
  const user = getUser();
  const displayName = user?.name || "Signed-in user";
  const displayEmail = user?.email || "";
  const initials = getInitials(displayName);
  const pageLabel = navItems.find((n) => n.to === currentPath)?.label ?? "";

  const handleLogout = async () => {
    await signOut();
    clearUser();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-medical-500 rounded-xl flex items-center justify-center animate-pulse">
            <ShieldPlus className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-ink-500 font-medium">Checking your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-ink-950 flex flex-col z-30 transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center">
              <ShieldPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">HealthGuard AI</div>
              <div className="text-[10px] text-ink-400 font-mono uppercase tracking-wider">Research prototype</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => {
            const active = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${active ? "bg-medical-500 text-white" : "text-ink-400 hover:text-white hover:bg-white/5"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-medical-500/20 border border-medical-500/30 flex items-center justify-center text-medical-400 text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{displayName}</div>
              <div className="text-[11px] text-ink-500 truncate">{displayEmail}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-ink-200 px-6 h-14 flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-ink-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <span className="text-ink-400 hidden sm:inline">HealthGuard AI</span>
            <ChevronRight className="w-3 h-3 hidden sm:inline" />
            <span className="text-ink-900 font-medium">{pageLabel}</span>
          </div>
          <span className="ml-auto hidden sm:inline text-xs text-ink-500">
            3 simulated hospitals · 20 rounds · UCI data
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// ── Shared building blocks used by every app page ───────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-ink-950">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1 max-w-3xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, subtitle, children, className = "" }: { title?: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-2xl border border-ink-200 p-5 sm:p-6 min-w-0 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="font-semibold text-ink-950">{title}</h2>
          {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{label}</p>
        <Icon className="w-4 h-4 text-medical-500 shrink-0" />
      </div>
      <p className="mt-2 text-3xl font-bold text-ink-950 tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-ink-400 mt-3">Source: {children}</p>;
}
