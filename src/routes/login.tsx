import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldPlus, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { setUser } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const result = await signIn.email({ email: form.email, password: form.password });
    if (result.error) {
      setError(result.error.message || "Invalid email or password.");
      setLoading(false);
      return;
    }
    const u = result.data?.user as any;
    setUser({
      name: u?.name || form.email.split("@")[0],
      email: u?.email || form.email,
      hospitalName: u?.hospitalName || "",
      country: u?.country || "",
      department: u?.department || "",
      role: u?.role || "Node Administrator",
    });
    setLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-medical-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-safety-500/10 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-medical-500 rounded-xl flex items-center justify-center shadow-lg shadow-medical-500/30">
            <ShieldPlus className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">HealthGuard AI</span>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-500/20 border border-medical-500/30 text-medical-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-pulse" />
            Secure Aggregation Active
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Collective intelligence<br />
            <span className="text-ink-400">without data exposure.</span>
          </h2>
          <p className="text-ink-400 text-sm leading-relaxed max-w-sm">
            Train world-class disease prediction models across hospital networks.
            Patient data never leaves your firewall.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { value: "14", label: "Hospital Nodes" },
              { value: "94.2%", label: "Model Accuracy" },
              { value: "412", label: "Training Rounds" },
              { value: "ε 0.045", label: "Privacy Budget" },
            ].map(({ value, label }) => (
              <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-white font-mono">{value}</div>
                <div className="text-xs text-ink-500 mt-1 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-600 font-mono">
          HIPAA · GDPR · SOC 2 · ISO 27001
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center">
              <ShieldPlus className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-ink-950">HealthGuard AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink-950">Welcome back</h1>
            <p className="text-sm text-ink-500 mt-1">Sign in to your hospital node account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@hospital.org"
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent transition-all placeholder:text-ink-300"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-medical-600 hover:text-medical-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent transition-all placeholder:text-ink-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-medical-500/20 mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <><ArrowRight className="w-4 h-4" /> Sign In</>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-medical-600 font-semibold hover:text-medical-700 transition-colors">
              Register your hospital
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-ink-200">
            <p className="text-center text-xs text-ink-400 font-mono uppercase tracking-wider">
              Protected by end-to-end encryption · TLS 1.3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
