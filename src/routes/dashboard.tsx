import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Network, BrainCircuit, ShieldCheck, Activity,
  TrendingUp, Clock, Users, Zap, RefreshCw,
} from "lucide-react";
import { getNodes, getModels, seedData } from "@/lib/server-fns";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

// Simulates a new accuracy/loss data point each refresh
function generateChartData(baseAccuracy: number, baseRound: number) {
  const points = 8;
  return Array.from({ length: points }, (_, i) => {
    const round = baseRound - (points - 1 - i) * 3;
    const acc = Math.max(0, baseAccuracy - (points - 1 - i) * 0.8 + (Math.random() * 0.2 - 0.1));
    const loss = Math.max(0.1, 0.31 - i * 0.016 + (Math.random() * 0.005 - 0.0025));
    return {
      round: `R${round}`,
      accuracy: Math.round(acc * 10) / 10,
      loss: Math.round(loss * 1000) / 1000,
    };
  });
}

function generateActivity(nodes: any[], model: any) {
  const nodeNames = nodes.filter((n) => n.status === "online").map((n) => n.name);
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const events = [
    { event: `Round #${model?.currentRound ?? 412} aggregation completed`, type: "success" },
    { event: `${pick(nodeNames.length ? nodeNames : ["Mayo Clinic"])} submitted gradient update`, type: "info" },
    { event: `Privacy budget updated: ε=${model?.privacyBudget ?? 0.045}`, type: "info" },
    { event: `${model?.name ?? "CardioRisk-v4"} weights dispatched to all nodes`, type: "success" },
    { event: `Secure aggregation round verified`, type: "success" },
    { event: `Differential privacy noise calibrated`, type: "info" },
  ];
  // shuffle and pick 5
  return events
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((e, i) => ({
      ...e,
      time: i === 0 ? "just now" : `${(i + 1) * 3 + Math.floor(Math.random() * 3)} min ago`,
    }));
}

function StatCard({
  icon: Icon, label, value, sub, pulse = false,
}: {
  icon: React.ElementType; label: string; value: string; sub: string; pulse?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{label}</p>
          <p className={`mt-2 text-3xl font-bold text-ink-950 tracking-tight transition-all duration-500 ${pulse ? "text-medical-600" : ""}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-ink-400">{sub}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-medical-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-medical-500" />
        </div>
      </div>
    </div>
  );
}

function NodeStatusDot({ status }: { status: string }) {
  if (status === "online") return <span className="w-2 h-2 rounded-full bg-safety-500 inline-block" />;
  if (status === "syncing") return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-ink-300 inline-block" />;
}

function DashboardPage() {
  const [dbNodes, setDbNodes] = useState<any[]>([]);
  const [dbModels, setDbModels] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    const [nodes, models] = await Promise.all([getNodes(), getModels()]);
    setDbNodes(nodes);
    setDbModels(models);
    const active = models.find((m) => m.status === "training") || models[0];
    setChartData(generateChartData(active?.accuracy ?? 94.2, active?.currentRound ?? 412));
    setActivity(generateActivity(nodes, active));
    setLastRefresh(new Date());
    setCountdown(30);
    if (showSpinner) setTimeout(() => setRefreshing(false), 400);
  }, []);

  // Initial seed + load
  useEffect(() => {
    seedData().then(() => load());
  }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    intervalRef.current = setInterval(() => load(), 30000);
    countdownRef.current = setInterval(() => setCountdown((c) => (c <= 1 ? 30 : c - 1)), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [load]);

  const activeModel = dbModels.find((m) => m.status === "training") || dbModels[0];
  const onlineNodes = dbNodes.filter((n) => n.status === "online").length;
  const totalNodes = dbNodes.length || 14;
  const accuracy = activeModel?.accuracy ?? 94.2;
  const privacyBudget = activeModel?.privacyBudget ?? 0.045;
  const currentRound = activeModel?.currentRound ?? 412;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-950">Dashboard</h1>
            <p className="text-sm text-ink-500 mt-1">
              Active model: <span className="font-mono font-semibold text-medical-600">{activeModel?.name ?? "CardioRisk-v4"}</span>
              {" · "}Global Round #{currentRound}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-safety-500/10 border border-safety-500/20 rounded-xl text-safety-600 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Secure Aggregation Active
            </div>
            {/* Refresh button + countdown */}
            <button
              onClick={() => load(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200 bg-white hover:bg-ink-50 transition-colors text-xs font-medium text-ink-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="font-mono">{countdown}s</span>
            </button>
          </div>
        </div>

        {/* Last refresh */}
        <p className="text-[11px] text-ink-400 -mt-3 font-mono">
          Last updated: {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Network} label="Active Nodes" value={`${onlineNodes}/${totalNodes}`} sub={`${totalNodes - onlineNodes} offline or syncing`} />
          <StatCard icon={BrainCircuit} label="Model Accuracy" value={`${accuracy}%`} sub="+0.4% from last round" pulse />
          <StatCard icon={ShieldCheck} label="Privacy Budget (ε)" value={String(privacyBudget)} sub="Well within safe threshold" />
          <StatCard icon={Activity} label="Training Rounds" value={String(currentRound)} sub="Avg 4.8s per round" pulse />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-ink-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-ink-950">Model Accuracy</h3>
                <p className="text-xs text-ink-500 mt-0.5">Last 8 training rounds · live</p>
              </div>
              <div className="flex items-center gap-1.5 text-safety-600 text-xs font-semibold bg-safety-500/10 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> +6.1%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.14 195)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="oklch(0.62 0.14 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255)" />
                <XAxis dataKey="round" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[85, 96]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, "Accuracy"]} />
                <Area type="monotone" dataKey="accuracy" stroke="oklch(0.62 0.14 195)" strokeWidth={2} fill="url(#accGrad)" dot={{ r: 3, fill: "oklch(0.62 0.14 195)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-ink-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-ink-950">Validation Loss</h3>
                <p className="text-xs text-ink-500 mt-0.5">Last 8 training rounds · live</p>
              </div>
              <div className="flex items-center gap-1.5 text-medical-600 text-xs font-semibold bg-medical-500/10 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 rotate-180" /> Decreasing
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255)" />
                <XAxis dataKey="round" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0.15, 0.35]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [v, "Loss"]} />
                <Line type="monotone" dataKey="loss" stroke="oklch(0.53 0.13 198)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nodes + Activity */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
          {/* Node list */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-ink-950">Connected Nodes</h3>
              <span className="text-xs text-ink-500 font-mono">{onlineNodes} / {totalNodes} active</span>
            </div>
            <div className="space-y-3">
              {(dbNodes.length > 0 ? dbNodes : []).slice(0, 8).map((node: any) => (
                <div
                  key={node.id ?? node.name}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl border transition-colors ${
                    node.status === "offline"
                      ? "border-ink-100 opacity-50"
                      : "border-ink-100 hover:border-medical-200 hover:bg-medical-50/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <NodeStatusDot status={node.status} />
                    <div>
                      <div className="text-sm font-medium text-ink-900">{node.name}</div>
                      <div className="text-[11px] text-ink-400">{node.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-ink-600">{node.latency ?? "—"}</div>
                    {(node.contribution ?? 0) > 0 && (
                      <div className="text-[11px] text-ink-400">{node.contribution}% contrib.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-ink-950">Live Activity</h3>
              <div className="flex items-center gap-1.5 text-xs text-medical-600 font-semibold">
                <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-pulse" />
                Live
              </div>
            </div>
            <div className="space-y-4">
              {activity.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.type === "success" ? "bg-safety-500" :
                    item.type === "warning" ? "bg-amber-400" : "bg-medical-400"
                  }`} />
                  <div>
                    <p className="text-sm text-ink-700">{item.event}</p>
                    <p className="text-[11px] text-ink-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="mt-6 pt-5 border-t border-ink-100 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-[11px] text-ink-500 uppercase tracking-wider mb-1">Round Latency</div>
                <div className="font-mono font-bold text-ink-900 text-sm">4.8s avg</div>
              </div>
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-[11px] text-ink-500 uppercase tracking-wider mb-1">Gradient Noise</div>
                <div className="font-mono font-bold text-ink-900 text-sm">0.002 σ</div>
              </div>
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-[11px] text-ink-500 uppercase tracking-wider mb-1">Participants</div>
                <div className="font-mono font-bold text-ink-900 text-sm flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> {onlineNodes} / {totalNodes}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="text-[11px] text-ink-500 uppercase tracking-wider mb-1">Aggregation</div>
                <div className="font-mono font-bold text-ink-900 text-sm">Weighted FedAvg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
