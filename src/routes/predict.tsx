import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel } from "@/components/layout/AppLayout";
import { useMemo, useState } from "react";
import { Stethoscope, Info, Loader2, FlaskConical, CheckCircle } from "lucide-react";
import { savePrediction } from "@/lib/server-fns";
import { computeRisk, WORKED_EXAMPLE, type RiskInput } from "@/lib/risk";
import { RISK_STYLE, RiskBadge } from "@/components/risk-ui";

export const Route = createFileRoute("/predict")({
  component: PredictPage,
});

type Form = Record<"age" | "systolicBP" | "diastolicBP" | "heartRate" | "cholesterol" | "glucose" | "bmi", string> & {
  gender: "male" | "female" | "other";
  smoker: boolean;
  diabetic: boolean;
};

const empty: Form = { age: "", gender: "male", systolicBP: "", diastolicBP: "", heartRate: "", cholesterol: "", glucose: "", bmi: "", smoker: false, diabetic: false };

const fields: { key: keyof Form; label: string; unit: string; placeholder: string; required: boolean; step?: string; hint?: string }[] = [
  { key: "age", label: "Age", unit: "years", placeholder: "52", required: true },
  { key: "systolicBP", label: "Systolic BP", unit: "mmHg", placeholder: "145", required: true },
  { key: "cholesterol", label: "Total cholesterol", unit: "mg/dL", placeholder: "210", required: true },
  { key: "glucose", label: "Fasting glucose", unit: "mg/dL", placeholder: "110", required: true },
  { key: "bmi", label: "BMI", unit: "kg/m²", placeholder: "28", required: true, step: "0.1" },
  { key: "diastolicBP", label: "Diastolic BP", unit: "mmHg", placeholder: "90", required: false, hint: "Recorded, not scored" },
  { key: "heartRate", label: "Heart rate", unit: "bpm", placeholder: "76", required: false, hint: "Recorded, not scored" },
];

function toInput(f: Form): RiskInput | null {
  const n = (v: string) => (v === "" ? NaN : Number(v));
  const x = { age: n(f.age), systolicBP: n(f.systolicBP), cholesterol: n(f.cholesterol), glucose: n(f.glucose), bmi: n(f.bmi), smoker: f.smoker, diabetic: f.diabetic };
  return [x.age, x.systolicBP, x.cholesterol, x.glucose, x.bmi].some(Number.isNaN) ? null : x;
}

function PredictPage() {
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const input = toInput(form);
  const result = useMemo(() => (input ? computeRisk(input) : null), [JSON.stringify(input)]);

  const set = (key: keyof Form, value: string | boolean) => {
    setSaved(false);
    setForm((p) => ({ ...p, [key]: value }));
  };

  const loadExample = () => {
    setSaved(false);
    setForm({ ...empty, age: "52", systolicBP: "145", cholesterol: "210", glucose: "110", bmi: "28", smoker: WORKED_EXAMPLE.smoker, diabetic: WORKED_EXAMPLE.diabetic });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    setSaving(true);
    setError("");
    try {
      await savePrediction({
        data: {
          ...input,
          age: Math.round(input.age),
          systolicBP: Math.round(input.systolicBP),
          cholesterol: Math.round(input.cholesterol),
          glucose: Math.round(input.glucose),
          gender: form.gender,
          diastolicBP: form.diastolicBP ? Math.round(Number(form.diastolicBP)) : undefined,
          heartRate: form.heartRate ? Math.round(Number(form.heartRate)) : undefined,
        },
      });
      setSaved(true);
    } catch (err: any) {
      setError(err?.message?.includes("session") ? err.message : "Couldn't save. Check that every value is in a realistic range and try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-ink-900 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent placeholder:text-ink-300";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Clinical risk check"
          subtitle="A transparent, rule-based triage score from the paper (Sec. IV.G). It is separate from the federated model, and the model's accuracies do not apply to it."
          action={
            <button onClick={loadExample} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-50">
              <FlaskConical className="w-4 h-4" /> Load the paper's worked example
            </button>
          }
        />

        <div className="flex items-start gap-3 p-4 rounded-xl bg-medical-500/5 border border-medical-500/20 text-sm text-medical-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>The score updates as you type and is calculated in your browser. When you press <b>Save to history</b>, the vitals are sent to the server, scored again there, and stored in your account so you can track changes over time. Use test values, not real patient data.</span>
        </div>

        <div className="grid xl:grid-cols-[1fr_1.1fr] gap-4 items-start">
          <Panel title="Patient vitals">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label htmlFor={f.key} className="flex justify-between text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">
                      <span>{f.label}{f.required && " *"}</span>
                      {f.hint && <span className="normal-case tracking-normal font-normal text-ink-400">{f.hint}</span>}
                    </label>
                    <div className="relative">
                      <input
                        id={f.key}
                        type="number"
                        inputMode="decimal"
                        step={f.step ?? "1"}
                        required={f.required}
                        value={form[f.key] as string}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className={inputCls + " pr-16"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">{f.unit}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <label htmlFor="gender" className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Sex</label>
                  <select id="gender" value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                {(["smoker", "diabetic"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                    <input id={k} type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} className="w-4 h-4 accent-[oklch(0.62_0.14_195)]" />
                    {k === "smoker" ? "Current smoker" : "Diagnosed diabetes"}
                  </label>
                ))}
              </div>

              {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={!input || saving}
                  className="flex-1 min-w-40 flex items-center justify-center gap-2 px-6 py-3 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Stethoscope className="w-4 h-4" /> Save to history</>}
                </button>
                <button type="button" onClick={() => { setForm(empty); setSaved(false); }} className="px-6 py-3 bg-ink-100 text-ink-700 font-semibold rounded-xl hover:bg-ink-200 transition-colors">
                  Clear
                </button>
              </div>
              {saved && (
                <p className="text-sm text-safety-600">
                  Saved to your account. <Link to="/predictions" className="font-semibold underline">See your history and trend</Link>
                </p>
              )}
            </form>
          </Panel>

          <Panel title="Result">
            {!result ? (
              <p className="text-sm text-ink-500 py-8 text-center">Fill in the five required values to see the score.</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-xs text-ink-500 uppercase tracking-wider">Risk score R</div>
                    <div className={`text-5xl font-bold tabular-nums ${RISK_STYLE[result.level].text}`}>{result.score}<span className="text-xl text-ink-400">/100</span></div>
                  </div>
                  <div className="text-right space-y-1">
                    <RiskBadge level={result.level} />
                    <div className="text-xs text-ink-500">Display confidence κ = {result.confidence}%</div>
                  </div>
                </div>
                <div className="relative h-2.5 rounded-full bg-ink-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${RISK_STYLE[result.level].bar}`} style={{ width: `${result.score}%` }} />
                  <div className="absolute inset-y-0 left-[30%] w-px bg-white" />
                  <div className="absolute inset-y-0 left-[55%] w-px bg-white" />
                </div>
                <div className="flex justify-between text-[11px] text-ink-400 -mt-3"><span>Low &lt; 30</span><span>Moderate 30–54</span><span>High ≥ 55</span></div>

                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm min-w-[460px]">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                        <th className="py-2 px-1">Stage</th><th className="py-2 px-1">Feature</th><th className="py-2 px-1">Value</th><th className="py-2 px-1">Band</th><th className="py-2 px-1 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.stages.map((s) => (
                        <tr key={s.stage} className="border-b border-ink-50">
                          <td className="py-2 px-1 text-ink-400 tabular-nums">{s.stage}</td>
                          <td className="py-2 px-1 text-ink-900 font-medium">{s.feature}<div className="text-[10px] text-ink-400 font-normal">{s.source}</div></td>
                          <td className="py-2 px-1 text-ink-600 tabular-nums">{s.value}</td>
                          <td className="py-2 px-1 text-ink-500 tabular-nums">{s.rule}</td>
                          <td className="py-2 px-1 text-right font-semibold tabular-nums">{s.points}<span className="text-ink-300">/{s.max}</span></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={4} className="py-2 px-1 text-ink-600">Raw score S<sub>raw</sub> (max 125), shown as R = min(100, S<sub>raw</sub>)</td>
                        <td className="py-2 px-1 text-right font-bold tabular-nums">{result.raw}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-ink-400">κ is a display heuristic, not a calibrated probability. This is a triage aid, not a diagnosis.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
