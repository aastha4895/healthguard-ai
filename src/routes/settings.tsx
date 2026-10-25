import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Save, CheckCircle, Shield, User, Building2, Loader2 } from "lucide-react";
import { getUser, setUser, getInitials } from "@/lib/auth";
import { updateProfile } from "@/lib/server-fns";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "hospital", label: "Hospital", icon: Building2 },
  { id: "security", label: "Password", icon: Shield },
] as const;
type Tab = (typeof tabs)[number]["id"];

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent disabled:bg-ink-50 disabled:text-ink-500";
const labelCls = "block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5";

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; msg?: string }>({ kind: "idle" });
  const user = getUser();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    hospitalName: user?.hospitalName || "",
    country: user?.country || "",
    department: user?.department || "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const change = (t: Tab) => { setTab(t); setStatus({ kind: "idle" }); };

  const saveProfile = async () => {
    setStatus({ kind: "saving" });
    try {
      const saved = await updateProfile({ data: profile });
      setUser({ ...user!, name: saved.name, hospitalName: saved.hospitalName ?? "", country: saved.country ?? "", department: saved.department ?? "" });
      setStatus({ kind: "saved", msg: "Saved to your account." });
    } catch (e: any) {
      setStatus({ kind: "error", msg: e?.message?.includes("session") ? e.message : "Your name needs at least 2 characters." });
    }
  };

  const savePassword = async () => {
    if (pw.next.length < 8) return setStatus({ kind: "error", msg: "The new password needs at least 8 characters." });
    if (pw.next !== pw.confirm) return setStatus({ kind: "error", msg: "The two new passwords don't match." });
    setStatus({ kind: "saving" });
    const res = await authClient.changePassword({ currentPassword: pw.current, newPassword: pw.next, revokeOtherSessions: true });
    if (res.error) return setStatus({ kind: "error", msg: res.error.message || "The current password is incorrect." });
    setPw({ current: "", next: "", confirm: "" });
    setStatus({ kind: "saved", msg: "Password changed. Other devices were signed out." });
  };

  const Button = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={onClick} disabled={status.kind === "saving"} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-medical-500 text-white hover:bg-medical-600 disabled:opacity-60">
        {status.kind === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {label}
      </button>
      {status.kind === "saved" && <span className="inline-flex items-center gap-1 text-sm text-safety-600"><CheckCircle className="w-4 h-4" /> {status.msg}</span>}
      {status.kind === "error" && <span className="text-sm text-red-600">{status.msg}</span>}
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <PageHeader title="Settings" subtitle="Your account details are stored in the database and used across the dashboard." />

        <div className="flex flex-col sm:flex-row gap-6">
          <nav className="flex sm:flex-col gap-1 sm:w-48 shrink-0 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => change(id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left whitespace-nowrap ${tab === id ? "bg-medical-500 text-white" : "text-ink-600 hover:bg-ink-100"}`}>
                <Icon className="w-4 h-4 shrink-0" /> {label}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-ink-200 p-6 space-y-6">
            {tab === "profile" && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-medical-500/10 border border-medical-500/20 flex items-center justify-center text-medical-600 text-lg font-bold">{getInitials(profile.name || "U")}</div>
                  <div>
                    <p className="font-semibold text-ink-900">{profile.name || "—"}</p>
                    <p className="text-xs text-ink-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="s-name" className={labelCls}>Full name</label>
                    <input id="s-name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="s-email" className={labelCls}>Email</label>
                    <input id="s-email" value={user?.email ?? ""} disabled className={inputCls} />
                  </div>
                </div>
                <Button onClick={saveProfile} label="Save profile" />
              </>
            )}

            {tab === "hospital" && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {([["hospitalName", "Hospital name"], ["country", "Country"], ["department", "Department"]] as const).map(([k, l]) => (
                    <div key={k}>
                      <label htmlFor={`s-${k}`} className={labelCls}>{l}</label>
                      <input id={`s-${k}`} value={profile[k]} onChange={(e) => setProfile((p) => ({ ...p, [k]: e.target.value }))} className={inputCls} />
                    </div>
                  ))}
                </div>
                <Button onClick={saveProfile} label="Save hospital details" />
              </>
            )}

            {tab === "security" && (
              <>
                <div className="space-y-4 max-w-md">
                  {([["current", "Current password"], ["next", "New password"], ["confirm", "Repeat new password"]] as const).map(([k, l]) => (
                    <div key={k}>
                      <label htmlFor={`pw-${k}`} className={labelCls}>{l}</label>
                      <input id={`pw-${k}`} type="password" autoComplete={k === "current" ? "current-password" : "new-password"} value={pw[k]} onChange={(e) => setPw((p) => ({ ...p, [k]: e.target.value }))} className={inputCls} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-500">Passwords are hashed by better-auth before they are stored. Sessions use secure cookies.</p>
                <Button onClick={savePassword} label="Change password" />
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
