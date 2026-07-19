import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldPlus, Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { setUser } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const steps = ["Account", "Hospital", "Review"];

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    hospitalName: "", country: "", nodeType: "full",
    patientCount: "", department: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(step + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      // @ts-ignore — extra fields passed through
      hospitalName: form.hospitalName,
      country: form.country,
      department: form.department,
      role: "admin",
    });
    if (result.error) {
      setLoading(false);
      alert(result.error.message || "Registration failed.");
      return;
    }
    setUser({
      name: form.name,
      email: form.email,
      hospitalName: form.hospitalName,
      country: form.country,
      department: form.department,
      role: "Node Administrator",
    });
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-safety-500/10 border border-safety-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-safety-500" />
          </div>
          <h1 className="text-2xl font-bold text-ink-950">Application submitted!</h1>
          <p className="text-sm text-ink-500 mt-3 leading-relaxed">
            Your hospital node registration for <span className="font-semibold text-ink-700">{form.hospitalName}</span> is under review.
            You'll receive an email at <span className="font-semibold text-ink-700">{form.email}</span> within 24 hours.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors shadow-lg shadow-medical-500/20"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center shadow-lg shadow-medical-500/30">
            <ShieldPlus className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-ink-950">HealthGuard AI</span>
        </div>

        <div className="bg-white rounded-2xl border border-ink-200 p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-safety-500 text-white" :
                  i === step ? "bg-medical-500 text-white" :
                  "bg-ink-100 text-ink-400"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? "text-ink-900" : "text-ink-400"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-safety-500" : "bg-ink-200"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleNext} className="space-y-4">
            {/* Step 0 — Account */}
            {step === 0 && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-ink-950">Create your account</h2>
                  <p className="text-sm text-ink-500 mt-1">You'll use this to manage your hospital node.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input required value={form.name} onChange={set("name")} placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Work Email</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="you@hospital.org"
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 1 — Hospital */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-ink-950">Hospital details</h2>
                  <p className="text-sm text-ink-500 mt-1">Tell us about your institution.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Hospital Name</label>
                  <input required value={form.hospitalName} onChange={set("hospitalName")} placeholder="e.g. General City Hospital"
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Country</label>
                  <select required value={form.country} onChange={set("country")}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent">
                    <option value="">Select country...</option>
                    {["United States", "United Kingdom", "Germany", "France", "Canada", "Australia", "Japan", "India", "Brazil", "Other"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Primary Department</label>
                  <select required value={form.department} onChange={set("department")}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent">
                    <option value="">Select department...</option>
                    {["Cardiology", "Neurology", "Oncology", "Endocrinology", "Critical Care", "General Medicine", "Other"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Approx. Patient Records</label>
                  <input type="number" value={form.patientCount} onChange={set("patientCount")} placeholder="e.g. 50000"
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
                </div>
              </>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-ink-950">Review & submit</h2>
                  <p className="text-sm text-ink-500 mt-1">Confirm your details before submitting.</p>
                </div>
                <div className="space-y-3 bg-ink-50 rounded-xl p-4 border border-ink-100">
                  {[
                    { label: "Name", value: form.name },
                    { label: "Email", value: form.email },
                    { label: "Hospital", value: form.hospitalName },
                    { label: "Country", value: form.country },
                    { label: "Department", value: form.department },
                    { label: "Patient Records", value: form.patientCount ? Number(form.patientCount).toLocaleString() : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-ink-500">{label}</span>
                      <span className="font-medium text-ink-900">{value || "—"}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-400 leading-relaxed">
                  By submitting, you agree to HealthGuard AI's terms of service and confirm your institution complies with applicable data protection regulations (HIPAA/GDPR).
                </p>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="px-5 py-3 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-colors">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors disabled:opacity-60 shadow-lg shadow-medical-500/20 text-sm">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  : step < 2
                    ? <><ArrowRight className="w-4 h-4" /> Continue</>
                    : <><CheckCircle className="w-4 h-4" /> Submit Application</>
                }
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="text-medical-600 font-semibold hover:text-medical-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
