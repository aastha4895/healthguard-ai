import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Stethoscope, Trash2, BellRing } from "lucide-react";
import { getMyPredictions, deletePrediction } from "@/lib/server-fns";
import { trend, tierEscalated, type RiskLevel } from "@/lib/risk";
import { RiskBadge, TrendBadge } from "@/components/risk-ui";

export const Route = createFileRoute("/predictions")({
  component: PredictionsHistoryPage,
});

function PredictionsHistoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    getMyPredictions()
      .then(setRows)
      .catch((e) => setError(e?.message ?? "Couldn't load your history."))
      .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    setRows((r) => r.filter((x) => x.id !== id));
    await deletePrediction({ data: { id } }).catch(load);
  };

  // oldest → newest for the trajectory
  const chron = [...rows].reverse();
  const chart = chron.map((p, i) => ({ n: i + 1, score: p.riskScore, when: new Date(p.createdAt).toLocaleString() }));
  const latest = chron[chron.length - 1];
  const previous = chron[chron.length - 2];
  const latestTrend = latest && previous ? trend(latest.riskScore, previous.riskScore) : null;
  const alert = latest && previous && tierEscalated(latest.riskLevel as RiskLevel, previous.riskLevel as RiskLevel);
  const counts = (lvl: RiskLevel) => rows.filter((r) => r.riskLevel === lvl).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Risk history"
          subtitle="Every saved risk check from your account, with the risk trajectory from the paper (Eq. 24–26): a change of more than 5 points marks a trend, and moving up a tier raises an alert."
          action={
            <Link to="/predict" className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 text-sm">
              <Stethoscope className="w-4 h-4" /> New risk check
            </Link>
          }
        />

        {error && <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {alert && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <BellRing className="w-4 h-4 mt-0.5 shrink-0" />
            <span><b>Alert:</b> the latest check moved from {previous.riskLevel} to {latest.riskLevel} risk. Consider a clinical review.</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-ink-200 p-4">
            <div className="text-xs text-ink-500 uppercase tracking-wider">Checks saved</div>
            <div className="text-3xl font-bold text-ink-950 tabular-nums mt-1">{rows.length}</div>
          </div>
          {(["low", "moderate", "high"] as const).map((l) => (
            <div key={l} className="bg-white rounded-2xl border border-ink-200 p-4">
              <RiskBadge level={l} />
              <div className="text-3xl font-bold text-ink-950 tabular-nums mt-2">{counts(l)}</div>
            </div>
          ))}
        </div>

        <Panel title="Risk trajectory" subtitle="Score R for each saved check, oldest to newest">
          {chart.length >= 2 ? (
            <>
              <div className="flex items-center gap-2 mb-3 text-sm text-ink-600">
                Latest change: {latestTrend && <TrendBadge trend={latestTrend.trend} delta={latestTrend.delta} />}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                    <ReferenceArea y1={0} y2={30} fill="oklch(0.72 0.17 160)" fillOpacity={0.06} />
                    <ReferenceArea y1={30} y2={55} fill="oklch(0.8 0.15 85)" fillOpacity={0.08} />
                    <ReferenceArea y1={55} y2={100} fill="oklch(0.63 0.2 25)" fillOpacity={0.06} />
                    <CartesianGrid vertical={false} stroke="oklch(0.929 0.013 255)" />
                    <XAxis dataKey="n" tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257)" }} tickLine={false} axisLine={false} label={{ value: "Check #", position: "insideBottomRight", offset: -2, fontSize: 11 }} />
                    <YAxis domain={[0, 100]} ticks={[0, 30, 55, 100]} tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257)" }} tickLine={false} axisLine={false} />
                    <Tooltip labelFormatter={(n) => chart[Number(n) - 1]?.when ?? ""} formatter={(v) => [v, "Score"]} />
                    <Line isAnimationActive={false} type="monotone" dataKey="score" stroke="oklch(0.53 0.13 198)" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-500 py-6 text-center">Save at least two risk checks to see a trend.</p>
          )}
        </Panel>

        <Panel title="All checks">
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-ink-100 rounded-xl animate-pulse" />)}</div>
          ) : rows.length ? (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                    <th className="py-2 px-2">Date</th><th className="py-2 px-2">Age</th><th className="py-2 px-2">BP</th><th className="py-2 px-2">Chol.</th><th className="py-2 px-2">Glucose</th><th className="py-2 px-2">BMI</th><th className="py-2 px-2">Flags</th><th className="py-2 px-2">Score</th><th className="py-2 px-2">Trend</th><th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => {
                    const prev = rows[i + 1];
                    const t = prev ? trend(p.riskScore, prev.riskScore) : null;
                    return (
                      <tr key={p.id} className="border-b border-ink-50 tabular-nums">
                        <td className="py-2.5 px-2 text-ink-500 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 px-2">{p.age}</td>
                        <td className="py-2.5 px-2">{p.systolicBP}{p.diastolicBP ? `/${p.diastolicBP}` : ""}</td>
                        <td className="py-2.5 px-2">{p.cholesterol}</td>
                        <td className="py-2.5 px-2">{p.glucose}</td>
                        <td className="py-2.5 px-2">{p.bmi}</td>
                        <td className="py-2.5 px-2 text-xs text-ink-500">{[p.smoker && "Smoker", p.diabetic && "Diabetic"].filter(Boolean).join(", ") || "—"}</td>
                        <td className="py-2.5 px-2"><span className="font-semibold mr-2">{p.riskScore}</span><RiskBadge level={p.riskLevel} /></td>
                        <td className="py-2.5 px-2">{t ? <TrendBadge trend={t.trend} delta={t.delta} /> : <span className="text-xs text-ink-400">First check</span>}</td>
                        <td className="py-2.5 px-2 text-right">
                          <button onClick={() => remove(p.id)} aria-label="Delete check" className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="font-medium text-ink-600">No risk checks yet</p>
              <p className="text-sm text-ink-400 mt-1">Run your first check to start a history.</p>
            </div>
          )}
        </Panel>
      </div>
    </AppLayout>
  );
}
