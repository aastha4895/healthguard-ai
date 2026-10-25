import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldPlus, Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { setUser } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const steps = ["Account", "Hospital", "Review"];
const inputCls = "w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent";
const labelCls = "block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5";

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", hospitalName: "", country: "", department: "" });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 0 && form.password.length < 8) return setError("The password needs at least 8 characters.");
    if (step < 2) return setStep(step + 1);
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      // @ts-ignore — extra user fields declared in auth-server.ts
      hospitalName: form.hospitalName,
      country: form.country,
      department: form.department,
    });
    if (result.error) {
      setLoading(false);
      setError(result.error.status === 422 ? "An account with this email already exists. Sign in instead." : result.error.message || "Couldn't create the account. Try again.");
      setStep(0);
      return;
    }
    // better-auth signs the new user in straight away
    setUser({ name: form.name, email: form.email, hospitalName: form.hospitalName, country: form.country, department: form.department, role: "admin" });
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center">
            <ShieldPlus className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-ink-950">HealthGuard AI</span>
        </Link>

        <div className="bg-white rounded-2xl border border-ink-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? "bg-safety-500 text-white" : i === step ? "bg-medical-500 text-white" : "bg-ink-100 text-ink-400"}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? "text-ink-900" : "text-ink-400"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-safety-500" : "bg-ink-200"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleNext} className="space-y-4">
            {step === 0 && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold text-ink-950">Create your account</h1>
                  <p className="text-sm text-ink-500 mt-1">You'll use it to sign in to the dashboard and keep your risk-check history.</p>
                </div>
                <div>
                  <label htmlFor="r-name" className={labelCls}>Full name</label>
                  <input id="r-name" required value={form.name} onChange={set("name")} placeholder="Aastha Tiwari" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="r-email" className={labelCls}>Email</label>
                  <input id="r-email" required type="email" autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="r-password" className={labelCls}>Password</label>
                  <div className="relative">
                    <input id="r-password" required type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" className={inputCls + " pr-12"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Show password" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold text-ink-950">Hospital details</h1>
                  <p className="text-sm text-ink-500 mt-1">Optional. Shown on your profile.</p>
                </div>
                <div>
                  <label htmlFor="r-hospital" className={labelCls}>Hospital or institution</label>
                  <input id="r-hospital" value={form.hospitalName} onChange={set("hospitalName")} placeholder="e.g. Hospital A" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="r-country" className={labelCls}>Country</label>
                  <select id="r-country" value={form.country} onChange={set("country")} className={inputCls}>
                    <option value="">Select country…</option>
                    {["India", "United States", "United Kingdom", "Germany", "Canada", "Australia", "Other"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="r-dept" className={labelCls}>Department</label>
                  <select id="r-dept" value={form.department} onChange={set("department")} className={inputCls}>
                    <option value="">Select department…</option>
                    {["Cardiology", "Endocrinology", "General Medicine", "Research", "Other"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-6">
                  <h1 className="text-lg font-bold text-ink-950">Review</h1>
                  <p className="text-sm text-ink-500 mt-1">Check your details, then create the account.</p>
                </div>
                <dl className="space-y-3 bg-ink-50 rounded-xl p-4 border border-ink-100">
                  {[["Name", form.name], ["Email", form.email], ["Hospital", form.hospitalName], ["Country", form.country], ["Department", form.department]].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-ink-500">{l}</dt>
                      <dd className="font-medium text-ink-900 truncate">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 disabled:opacity-60 text-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : step < 2 ? <><ArrowRight className="w-4 h-4" /> Continue</> : <><CheckCircle className="w-4 h-4" /> Create account</>}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account? <Link to="/login" className="text-medical-600 font-semibold hover:text-medical-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
