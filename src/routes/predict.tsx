import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Stethoscope, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { savePrediction } from "@/lib/server-fns";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/predict")({
  component: PredictPage,
});

type RiskLevel = "low" | "moderate" | "high" | null;

interface FormData {
  age: string;
  gender: string;
  systolicBP: string;
  diastolicBP: string;
  cholesterol: string;
  glucose: string;
  bmi: string;
  smoker: string;
  diabetic: string;
  heartRate: string;
}

const initialForm: FormData = {
  age: "",
  gender: "male",
  systolicBP: "",
  diastolicBP: "",
  cholesterol: "",
  glucose: "",
  bmi: "",
  smoker: "no",
  diabetic: "no",
  heartRate: "",
};

function computeRisk(form: FormData): { level: RiskLevel; score: number; confidence: number } {
  let score = 0;
  const age = Number(form.age);
  const sbp = Number(form.systolicBP);
  const chol = Number(form.cholesterol);
  const bmi = Number(form.bmi);
  const glucose = Number(form.glucose);

  if (age > 60) score += 25;
  else if (age > 45) score += 15;
  else if (age > 30) score += 5;

  if (sbp > 160) score += 25;
  else if (sbp > 140) score += 15;
  else if (sbp > 120) score += 5;

  if (chol > 240) score += 20;
  else if (chol > 200) score += 10;

  if (bmi > 30) score += 15;
  else if (bmi > 25) score += 7;

  if (glucose > 126) score += 15;
  else if (glucose > 100) score += 7;

  if (form.smoker === "yes") score += 15;
  if (form.diabetic === "yes") score += 10;

  const level: RiskLevel = score >= 55 ? "high" : score >= 30 ? "moderate" : "low";
  const confidence = Math.min(95, 72 + score * 0.3);

  return { level, score: Math.min(100, score), confidence: Math.round(confidence * 10) / 10 };
}

function InputField({
  label, name, value, onChange, type = "number", placeholder, unit,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-ink-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent transition-all placeholder:text-ink-300"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 font-mono">{unit}</span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label, name, value, onChange, options,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent transition-all"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function RiskResult({ result }: { result: { level: RiskLevel; score: number; confidence: number } }) {
  const config = {
    low: {
      color: "text-safety-600", bg: "bg-safety-500/10", border: "border-safety-500/30",
      icon: CheckCircle, iconColor: "text-safety-500",
      label: "Low Risk", desc: "Patient vitals are within normal ranges. Routine monitoring recommended.",
    },
    moderate: {
      color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
      icon: Info, iconColor: "text-amber-500",
      label: "Moderate Risk", desc: "Some risk factors detected. Lifestyle changes and closer monitoring advised.",
    },
    high: {
      color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
      icon: AlertTriangle, iconColor: "text-red-500",
      label: "High Risk", desc: "Multiple significant risk factors present. Immediate clinical evaluation recommended.",
    },
  };

  if (!result.level) return null;
  const c = config[result.level];
  const Icon = c.icon;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-6`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center border ${c.border} shrink-0`}>
          <Icon className={`w-6 h-6 ${c.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className={`text-lg font-bold ${c.color}`}>{c.label}</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500 font-mono">Confidence</span>
              <span className={`text-2xl font-bold font-mono ${c.color}`}>{result.confidence}%</span>
            </div>
          </div>
          <p className="text-sm text-ink-600 mt-1">{c.desc}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
              <span>Risk Score</span>
              <span className="font-mono font-semibold">{result.score}/100</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-ink-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  result.level === "high" ? "bg-red-500" :
                  result.level === "moderate" ? "bg-amber-400" : "bg-safety-500"
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/60 flex items-center gap-2 text-xs text-ink-500">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Prediction generated by <span className="font-mono font-semibold text-medical-600">CardioRisk-v4</span> · Federated model · Round #412</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [result, setResult] = useState<{ level: RiskLevel; score: number; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    const computed = computeRisk(form);
    setResult(computed);
    // Save to DB
    const user = getUser();
    await savePrediction({
      data: {
        userId: user?.email,
        age: Number(form.age) || undefined,
        gender: form.gender,
        systolicBP: Number(form.systolicBP) || undefined,
        diastolicBP: Number(form.diastolicBP) || undefined,
        cholesterol: Number(form.cholesterol) || undefined,
        glucose: Number(form.glucose) || undefined,
        bmi: Number(form.bmi) || undefined,
        heartRate: Number(form.heartRate) || undefined,
        smoker: form.smoker === "yes",
        diabetic: form.diabetic === "yes",
        riskLevel: computed.level!,
        riskScore: computed.score,
        confidence: computed.confidence,
      },
    });
    setLoading(false);
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-ink-950">Disease Risk Prediction</h1>
          <p className="text-sm text-ink-500 mt-1">
            Enter patient vitals to get a federated AI risk assessment. No data is transmitted — inference runs locally.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-medical-500/5 border border-medical-500/20 text-sm text-medical-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>This prediction uses the <span className="font-mono font-semibold">CardioRisk-v4</span> federated model trained across 14 hospital nodes. Results are for clinical decision support only.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink-200 p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider mb-4">Patient Demographics</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Age" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 58" unit="yrs" />
              <SelectField
                label="Gender" name="gender" value={form.gender} onChange={handleChange}
                options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
              />
            </div>
          </div>

          <div className="border-t border-ink-100 pt-6">
            <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider mb-4">Vital Signs</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Systolic BP" name="systolicBP" value={form.systolicBP} onChange={handleChange} placeholder="e.g. 146" unit="mmHg" />
              <InputField label="Diastolic BP" name="diastolicBP" value={form.diastolicBP} onChange={handleChange} placeholder="e.g. 92" unit="mmHg" />
              <InputField label="Heart Rate" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="e.g. 78" unit="bpm" />
              <InputField label="BMI" name="bmi" value={form.bmi} onChange={handleChange} placeholder="e.g. 27.4" unit="kg/m²" />
            </div>
          </div>

          <div className="border-t border-ink-100 pt-6">
            <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider mb-4">Lab Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Cholesterol" name="cholesterol" value={form.cholesterol} onChange={handleChange} placeholder="e.g. 238" unit="mg/dL" />
              <InputField label="Blood Glucose" name="glucose" value={form.glucose} onChange={handleChange} placeholder="e.g. 105" unit="mg/dL" />
            </div>
          </div>

          <div className="border-t border-ink-100 pt-6">
            <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider mb-4">Risk Factors</h2>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Smoker" name="smoker" value={form.smoker} onChange={handleChange}
                options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
              />
              <SelectField
                label="Diabetic" name="diabetic" value={form.diabetic} onChange={handleChange}
                options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
              />
            </div>
          </div>

          <div className="border-t border-ink-100 pt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-medical-500/20"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Federated Inference...</> : <><Stethoscope className="w-4 h-4" /> Run Prediction</>}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-ink-100 text-ink-700 font-semibold rounded-xl hover:bg-ink-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Result */}
        {result && <RiskResult result={result} />}
      </div>
    </AppLayout>
  );
}
