import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel, StatCard, SourceNote } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import { Network, BrainCircuit, ShieldCheck, Activity, ArrowRight, Stethoscope } from "lucide-react";
import { getNodes, getModels, getMyPredictions, seedData } from "@/lib/server-fns";
import { ACCURACY, FEDERATED_GAIN, FEDERATION, MIA_AUC, DATASETS } from "@/lib/paper-data";
import { RiskBadge } from "@/components/risk-ui";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const accuracyChart = [
  { condition: "Single hospital", Diabetes: ACCURACY.diabetes.singleHospital, Heart: ACCURACY.heart.singleHospital },
  { condition: "Federated, no DP", Diabetes: ACCURACY.diabetes.federatedNoDp, Heart: ACCURACY.heart.federatedNoDp },
  { condition: "Federated, σ = 0.05", Diabetes: ACCURACY.diabetes.federatedDp.mean, Heart: ACCURACY.heart.federatedDp.mean },
  { condition: "Federated, σ = 2.0", Diabetes: ACCURACY.diabetes.federatedHeavyDp.mean, Heart: ACCURACY.heart.federatedHeavyDp.mean },
];

function DashboardPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [mine, setMine] = useState<any[]>([]);

  useEffect(() => {
    seedData()
      .catch(() => null)
      .then(() => Promise.all([getNodes(), getModels(), getMyPredictions().catch(() => [])]))
      .then(([n, m, p]) => { setNodes(n); setModels(m); setMine(p); });
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle={`Results of federated training across ${FEDERATION.hospitals} simulated hospitals for ${FEDERATION.rounds} rounds, averaged over ${FEDERATION.seeds} seeds. All figures come from the research paper.`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Network} label="Hospitals" value={String(FEDERATION.hospitals)} sub="Simulated clients, non-IID split" />
          <StatCard icon={Activity} label="Training rounds" value={String(FEDERATION.rounds)} sub="FedAvg, sample-weighted" />
          <StatCard icon={BrainCircuit} label="Diabetes accuracy" value={`${ACCURACY.diabetes.federatedDp.mean}%`} sub={`+${FEDERATED_GAIN.diabetes} pts over one hospital`} />
          <StatCard icon={BrainCircuit} label="Heart accuracy" value={`${ACCURACY.heart.federatedDp.mean.toFixed(1)}%`} sub={`+${FEDERATED_GAIN.heart} pts over one hospital`} />
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
          <Panel title="Accuracy by training condition" subtitle="Federation helps; heavy noise (σ = 2.0) costs accuracy">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyChart} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="oklch(0.929 0.013 255)" />
                  <XAxis dataKey="condition" tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257)" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis domain={[40, 90]} tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: "oklch(0.968 0.007 247)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Diabetes" fill="oklch(0.62 0.14 195)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Diabetes" position="top" fontSize={10} formatter={(v: number) => `${v}`} />
                  </Bar>
                  <Bar dataKey="Heart" fill="oklch(0.32 0.05 260)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="Heart" position="top" fontSize={10} formatter={(v: number) => `${v}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <SourceNote>Tables V and VI (σ = 2.0 values are approximate, as reported).</SourceNote>
          </Panel>

          <Panel title="Privacy at a glance">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-safety-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">Attack stayed near chance</p>
                  <p className="text-sm text-ink-500">Membership-inference AUC {MIA_AUC.min}–{MIA_AUC.max} at every noise level (0.50 is a coin toss).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">Formal guarantee is weak</p>
                  <p className="text-sm text-ink-500">At σ = 0.05 the Rényi-DP budget is ε ≈ 37,511. Reaching ε ≈ 8 would need σ ≈ 9.26.</p>
                </div>
              </div>
              <Link to="/privacy" className="inline-flex items-center gap-1 text-sm font-semibold text-medical-600 hover:text-medical-700">
                Explore the privacy budget <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Panel>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Panel title="Hospitals in the federation" subtitle={`${DATASETS.diabetes.records} diabetes + ${DATASETS.heart.records} heart records, split non-IID`}>
            <ul className="divide-y divide-ink-100">
              {nodes.map((n) => (
                <li key={n.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${n.status === "online" ? "bg-safety-500" : "bg-ink-300"}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">{n.name}</div>
                      <div className="text-[11px] text-ink-400 truncate">{n.location}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-ink-500">{n.source === "paper" ? "Paper experiment" : "Added by a user"}</span>
                </li>
              ))}
              {!nodes.length && <li className="py-6 text-sm text-ink-400">Loading hospitals…</li>}
            </ul>
            <p className="text-xs text-ink-500 mt-3">{models.length} model{models.length === 1 ? "" : "s"} registered · <Link to="/models" className="text-medical-600 font-semibold">View models</Link></p>
          </Panel>

          <Panel title="Your recent risk checks" subtitle="Saved to your account">
            {mine.length ? (
              <ul className="divide-y divide-ink-100">
                {mine.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="text-sm text-ink-700">
                      Age {p.age} · BP {p.systolicBP} · Score <span className="font-semibold tabular-nums">{p.riskScore}</span>
                      <div className="text-[11px] text-ink-400">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <RiskBadge level={p.riskLevel} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-ink-500">No risk checks yet.</p>
                <Link to="/predict" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-medical-500 text-white text-sm font-semibold rounded-xl hover:bg-medical-600">
                  <Stethoscope className="w-4 h-4" /> Run a risk check
                </Link>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
