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
  Bell,
  ChevronRight,
  History,
} from "lucide-react";
import { useState } from "react";
import { getUser, clearUser, getInitials } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Network, label: "Nodes", to: "/nodes" },
  { icon: BrainCircuit, label: "Models", to: "/models" },
  { icon: Stethoscope, label: "Predictions", to: "/predict" },
  { icon: History, label: "History", to: "/predictions" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { loading } = useAuth(true);
  const user = getUser();
  const displayName = user?.name || "Hospital Admin";
  const displayEmail = user?.email || "admin@healthguard.ai";
  const initials = getInitials(displayName);

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
          <p className="text-sm text-ink-500 font-medium">Loading HealthGuard AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-ink-950 flex flex-col z-30 transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center shadow-lg shadow-medical-500/30">
              <ShieldPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">HealthGuard AI</div>
              <div className="text-[10px] text-ink-400 font-mono uppercase tracking-wider">Federated Network</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => {
            const active = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${active
                    ? "bg-medical-500 text-white shadow-lg shadow-medical-500/25"
                    : "text-ink-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-medical-500/20 border border-medical-500/30 flex items-center justify-center text-medical-400 text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{displayName}</div>
              <div className="text-[11px] text-ink-500 truncate">{displayEmail}</div>
            </div>
            <LogOut className="w-4 h-4 text-ink-500 group-hover:text-ink-300 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-ink-200 px-6 h-16 flex items-center justify-between">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm text-ink-500">
            <span className="text-ink-400">HealthGuard AI</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink-900 font-medium capitalize">
              {currentPath.replace("/", "") || "Home"}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-safety-500/10 border border-safety-500/20 text-safety-600 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-safety-500 rounded-full animate-pulse" />
              Network Active
            </div>
            <button className="relative p-2 rounded-lg hover:bg-ink-100 transition-colors">
              <Bell className="w-4 h-4 text-ink-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-medical-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
