import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import {
  Save, Eye, EyeOff, RefreshCw, Copy, CheckCircle,
  Shield, Bell, User, Key, Building2,
} from "lucide-react";
import { getUser, setUser, getInitials } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "hospital", label: "Hospital", icon: Building2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const user = getUser();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "Node Administrator",
  });
  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: user?.hospitalName || "",
    country: user?.country || "",
    department: user?.department || "",
  });

  const initials = getInitials(profileForm.name || "HA");
  const apiKey = "hg_live_sk_xK9mP2qLrT8nVwZ3jY5cF1dA6bE4";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (tab: string) => {
    if (tab === "profile") {
      setUser({ ...user!, name: profileForm.name, email: profileForm.email, role: profileForm.role });
    } else if (tab === "hospital") {
      setUser({ ...user!, hospitalName: hospitalForm.hospitalName, country: hospitalForm.country, department: hospitalForm.department });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-950">Settings</h1>
          <p className="text-sm text-ink-500 mt-1">Manage your account, hospital node, and API configuration.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <aside className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === id
                      ? "bg-medical-500 text-white shadow-lg shadow-medical-500/20"
                      : "text-ink-600 hover:bg-ink-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-ink-200 p-6">

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="font-bold text-ink-950">Personal Profile</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-medical-500/10 border border-medical-500/20 flex items-center justify-center text-medical-600 text-xl font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{profileForm.name || "—"}</p>
                    <p className="text-xs text-ink-500">{profileForm.email || "—"}</p>
                    <button className="text-xs text-medical-600 font-medium mt-1 hover:text-medical-700">Change avatar</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Email</label>
                    <input value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@hospital.org"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Role</label>
                    <input value={profileForm.role} onChange={(e) => setProfileForm(p => ({ ...p, role: e.target.value }))}
                      placeholder="e.g. Chief Data Officer"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                </div>
                <SaveButton saved={saved} onClick={() => handleSave("profile")} />
              </div>
            )}

            {/* Hospital */}
            {activeTab === "hospital" && (
              <div className="space-y-6">
                <h2 className="font-bold text-ink-950">Hospital Node Configuration</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Hospital Name</label>
                    <input value={hospitalForm.hospitalName} onChange={(e) => setHospitalForm(p => ({ ...p, hospitalName: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Country</label>
                    <input value={hospitalForm.country} onChange={(e) => setHospitalForm(p => ({ ...p, country: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Department</label>
                    <input value={hospitalForm.department} onChange={(e) => setHospitalForm(p => ({ ...p, department: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Node IP</label>
                    <input defaultValue="10.0.1.12"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Aggregation Method</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent">
                    <option>Weighted FedAvg</option>
                    <option>FedProx</option>
                    <option>SCAFFOLD</option>
                  </select>
                </div>
                <div className="p-4 rounded-xl bg-ink-50 border border-ink-100 space-y-3">
                  <p className="text-xs font-bold text-ink-600 uppercase tracking-wider">Compliance Status</p>
                  {["HIPAA Compliant", "GDPR Compliant", "SOC 2 Certified", "ISO 27001"].map((c) => (
                    <div key={c} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-safety-500" />
                      <span className="text-ink-700">{c}</span>
                    </div>
                  ))}
                </div>
                <SaveButton saved={saved} onClick={() => handleSave("hospital")} />
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="font-bold text-ink-950">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">New Password</label>
                    <input type="password" placeholder="Min. 8 characters"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <input type="password" placeholder="Repeat new password"
                      className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Two-Factor Authentication</p>
                      <p className="text-xs text-ink-500 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-medical-500 text-white text-xs font-semibold rounded-lg hover:bg-medical-600 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
                <SaveButton saved={saved} onClick={handleSave} label="Update Password" />
              </div>
            )}

            {/* API Keys */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <h2 className="font-bold text-ink-950">API Keys</h2>
                <p className="text-sm text-ink-500">Use these keys to connect your hospital node to the HealthGuard AI federation network.</p>
                <div className="p-4 rounded-xl border border-ink-200 bg-ink-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-ink-600 uppercase tracking-wider">Live Secret Key</p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-safety-500/10 border border-safety-500/20 text-safety-600 font-semibold">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-ink-700 bg-white border border-ink-200 px-3 py-2.5 rounded-lg overflow-hidden">
                      {showKey ? apiKey : "hg_live_sk_" + "•".repeat(24)}
                    </code>
                    <button onClick={() => setShowKey(!showKey)} className="p-2.5 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 transition-colors">
                      {showKey ? <EyeOff className="w-4 h-4 text-ink-500" /> : <Eye className="w-4 h-4 text-ink-500" />}
                    </button>
                    <button onClick={handleCopy} className="p-2.5 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 transition-colors">
                      {copied ? <CheckCircle className="w-4 h-4 text-safety-500" /> : <Copy className="w-4 h-4 text-ink-500" />}
                    </button>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-ink-200 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Regenerate Key
                </button>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  <strong>Keep this key secret.</strong> Never expose it in client-side code or public repositories.
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="font-bold text-ink-950">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: "Training round completed", desc: "Get notified when a global training round finishes", defaultChecked: true },
                    { label: "Node goes offline", desc: "Alert when a connected hospital node disconnects", defaultChecked: true },
                    { label: "Model accuracy milestone", desc: "Notify when model accuracy improves by >1%", defaultChecked: true },
                    { label: "Privacy budget warning", desc: "Alert when ε approaches the configured threshold", defaultChecked: true },
                    { label: "New node joins federation", desc: "Notify when a new hospital node is approved", defaultChecked: false },
                    { label: "Weekly summary report", desc: "Receive a weekly digest of federation activity", defaultChecked: false },
                  ].map(({ label, desc, defaultChecked }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-ink-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{label}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                        <div className="w-9 h-5 bg-ink-200 peer-focus:ring-2 peer-focus:ring-medical-400 rounded-full peer peer-checked:bg-medical-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
                <SaveButton saved={saved} onClick={handleSave} label="Save Preferences" />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SaveButton({ saved, onClick, label = "Save Changes" }: { saved: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
        saved
          ? "bg-safety-500 text-white"
          : "bg-medical-500 text-white hover:bg-medical-600 shadow-lg shadow-medical-500/20"
      }`}
    >
      {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {label}</>}
    </button>
  );
}
