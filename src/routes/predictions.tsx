import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import {
  Stethoscope, AlertTriangle, CheckCircle, Info,
  Filter, ArrowRight, Calendar, User,
} from "lucide-react";
import { getPredictions } from "@/lib/server-fns";

export const Route = createFileRoute("/predictions")({
  component: PredictionsHistoryPage,
});

const riskConfig = {
  low: { label: "Low Risk", icon: CheckCircle, color: "text-safety-600", bg: "bg-safety-500/10 border-safety-500/20", bar: "bg-safety-500" },
  moderate: { label: "Moderate", icon: Info, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", bar: "bg-amber-400" },
  high: { label: "High Risk", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 border-red-200", bar: "bg-red-500" },
};

function PredictionsHistoryPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "low" | "moderate" | "high">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictions({ data: {} }).then((data) => {
      setPredictions(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? predictions : predictions.filter((p) => p.riskLevel === filter);

  const counts = {
    low: predictions.filter((p) => p.riskLevel === "low").length,
    moderate: predictions.filter((p) => p.riskLevel === "moderate").length,
    high: predictions.filter((p) => p.riskLevel === "high").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-950">Prediction History</h1>
            <p className="text-sm text-ink-500 mt-1">{predictions.length} total predictions · all saved to Neon DB</p>
          </div>
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors text-sm shadow-lg shadow-medical-500/20"
          >
            <Stethoscope className="w-4 h-4" /> New Prediction
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {(["low", "moderate", "high"] as const).map((r) => {
            const c = riskConfig[r];
            const Icon = c.icon;
            return (
              <button
                key={r}
                onClick={() => setFilter(filter === r ? "all" : r)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filter === r ? "ring-2 ring-medical-400 border-medical-300" : "border-ink-200 bg-white hover:border-medical-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${c.color}`} />
                  <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{c.label}</span>
                </div>
                <div className="text-3xl font-bold text-ink-950">{counts[r]}</div>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-400" />
          <div className="flex gap-2">
            {(["all", "low", "moderate", "high"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                  filter === f ? "bg-ink-950 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-300"
                }`}
              >
                {f === "all" ? "All" : riskConfig[f].label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-ink-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Predictions list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((p) => {
              const rc = riskConfig[p.riskLevel as keyof typeof riskConfig] ?? riskConfig.low;
              const Icon = rc.icon;
              return (
                <div key={p.id} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all ${rc.bg}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-white border flex items-center justify-center shrink-0 ${rc.bg}`}>
                        <Icon className={`w-5 h-5 ${rc.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${rc.color}`}>{rc.label}</span>
                          <span className="text-xs text-ink-400 font-mono">Score: {p.riskScore}/100</span>
                          <span className="text-xs text-ink-400 font-mono">Confidence: {p.confidence}%</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-ink-500">
                          {p.age && <span>Age: <span className="font-semibold text-ink-700">{p.age}</span></span>}
                          {p.gender && <span>Gender: <span className="font-semibold text-ink-700 capitalize">{p.gender}</span></span>}
                          {p.systolicBP && <span>BP: <span className="font-semibold text-ink-700">{p.systolicBP}/{p.diastolicBP}</span></span>}
                          {p.cholesterol && <span>Chol: <span className="font-semibold text-ink-700">{p.cholesterol} mg/dL</span></span>}
                          {p.bmi && <span>BMI: <span className="font-semibold text-ink-700">{p.bmi}</span></span>}
                          {p.smoker && <span className="text-amber-600 font-semibold">Smoker</span>}
                          {p.diabetic && <span className="text-amber-600 font-semibold">Diabetic</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-xs text-ink-400 justify-end">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                      {p.userId && (
                        <div className="flex items-center gap-1 text-xs text-ink-400 justify-end mt-1">
                          <User className="w-3 h-3" />
                          {p.userId}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="mt-4">
                    <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rc.bar}`}
                        style={{ width: `${p.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-ink-400">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-ink-600">No predictions yet</p>
            <p className="text-sm mt-1">Run your first prediction to see results here.</p>
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors text-sm"
            >
              Run Prediction <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
