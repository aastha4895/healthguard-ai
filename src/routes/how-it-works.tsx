import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { FEDERATION, MIA_AUC } from "@/lib/paper-data";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
});

const PHASES = [
  { key: "send", title: "Server sends the global model", body: "The server sends the current model W (a logistic-regression weight vector) to every hospital." },
  { key: "train", title: "Hospitals train locally", body: "Each hospital improves W on its own patient records. The records never leave the hospital." },
  { key: "protect", title: "Clip and add noise", body: `Each update is clipped to norm C = ${FEDERATION.clipNorm.toFixed(1)} and Gaussian noise (σ) is added, so no single update says too much.` },
  { key: "upload", title: "Send updates over TLS", body: "Only the noisy updates travel to the server, encrypted in transit. No patient data is sent." },
  { key: "average", title: "FedAvg", body: "The server averages the updates, weighting each hospital by its number of patients: W = Σ (nₖ / n) · Wₖ." },
];

const SERVER = { x: 300, y: 70 };
const HOSPITALS = [
  { name: "Hospital A", x: 100, y: 270 },
  { name: "Hospital B", x: 300, y: 270 },
  { name: "Hospital C", x: 500, y: 270 },
];

function FedAvgAnimation() {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const done = round === FEDERATION.rounds && phase === PHASES.length - 1;

  const step = () => {
    if (phase < PHASES.length - 1) setPhase(phase + 1);
    else if (round < FEDERATION.rounds) { setRound(round + 1); setPhase(0); }
  };

  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(step, 1300);
    return () => clearTimeout(t);
  });

  const key = PHASES[phase].key;
  const packetAt = (h: { x: number; y: number }) => (key === "send" ? h : key === "upload" ? SERVER : key === "average" ? SERVER : h);
  const showPackets = key === "send" || key === "upload";

  return (
    <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6 items-center">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 600 340" className="w-full min-w-[360px] max-w-2xl mx-auto" role="img" aria-label="Federated averaging illustration">
          {HOSPITALS.map((h) => (
            <line key={h.name} x1={SERVER.x} y1={SERVER.y + 30} x2={h.x} y2={h.y - 34} stroke="oklch(0.87 0.02 255)" strokeWidth="2" strokeDasharray="5 5" />
          ))}

          <g>
            <rect x={SERVER.x - 80} y={SERVER.y - 32} width="160" height="64" rx="14" fill="oklch(0.15 0.04 264)" className={key === "average" ? "animate-pulse" : ""} />
            <text x={SERVER.x} y={SERVER.y - 6} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">Server</text>
            <text x={SERVER.x} y={SERVER.y + 16} textAnchor="middle" fill="oklch(0.72 0.13 195)" fontSize="12">{key === "average" ? "averaging…" : "global model W"}</text>
          </g>

          {HOSPITALS.map((h) => (
            <g key={h.name}>
              <rect x={h.x - 78} y={h.y - 34} width="156" height="78" rx="14" fill="oklch(0.98 0.02 195)" stroke={key === "train" || key === "protect" ? "oklch(0.62 0.14 195)" : "oklch(0.9 0.07 195)"} strokeWidth="2" />
              <text x={h.x} y={h.y - 10} textAnchor="middle" fill="oklch(0.15 0.04 264)" fontSize="14" fontWeight="700">{h.name}</text>
              <text x={h.x} y={h.y + 10} textAnchor="middle" fill="oklch(0.554 0.046 257)" fontSize="11">private records stay here</text>
              <text x={h.x} y={h.y + 30} textAnchor="middle" fill="oklch(0.53 0.13 198)" fontSize="11" fontWeight="600">
                {key === "train" ? "training on local data" : key === "protect" ? "clip C = 3.0 + noise σ" : key === "upload" ? "sent ΔWₖ + noise" : ""}
              </text>
            </g>
          ))}

          {showPackets && HOSPITALS.map((h) => {
            const from = key === "send" ? SERVER : h;
            const to = packetAt(h);
            return (
              <g key={h.name + round + key} style={{ animation: "none" }}>
                <circle r="9" fill={key === "send" ? "oklch(0.15 0.04 264)" : "oklch(0.62 0.14 195)"}>
                  <animate attributeName="cx" from={from.x} to={to.x} dur="1s" fill="freeze" />
                  <animate attributeName="cy" from={from.y + (key === "send" ? 30 : -34)} to={to.y + (key === "send" ? -34 : 30)} dur="1s" fill="freeze" />
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wider text-ink-500">Round</span>
          <span className="text-3xl font-bold text-ink-950 tabular-nums">{round}<span className="text-base text-ink-400"> / {FEDERATION.rounds}</span></span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
          <div className="h-full bg-medical-500 transition-all" style={{ width: `${(((round - 1) * PHASES.length + phase + 1) / (FEDERATION.rounds * PHASES.length)) * 100}%` }} />
        </div>
        <ol className="space-y-2">
          {PHASES.map((p, i) => (
            <li key={p.key} className={`p-3 rounded-xl border transition-colors ${i === phase ? "border-medical-400 bg-medical-50" : "border-ink-100"}`}>
              <div className="text-sm font-semibold text-ink-900">{i + 1}. {p.title}</div>
              {i === phase && <p className="text-sm text-ink-600 mt-1">{p.body}</p>}
            </li>
          ))}
        </ol>
        <div className="flex gap-2">
          <button onClick={() => setPlaying(!playing)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-medical-500 text-white text-sm font-semibold hover:bg-medical-600">
            {playing && !done ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
          </button>
          <button onClick={step} disabled={done} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-700 hover:bg-ink-50 disabled:opacity-50">
            <SkipForward className="w-4 h-4" /> Step
          </button>
          <button onClick={() => { setRound(1); setPhase(0); setPlaying(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-700 hover:bg-ink-50">
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>
        <p className="text-xs text-ink-400">Illustration of the protocol. The real training ran offline in the research pipeline.</p>
      </div>
    </div>
  );
}

const threats = [
  { id: "A1", who: "External network attacker", goal: "Intercept updates between a hospital and the server", defence: "TLS encryption in transit", status: "Mitigated" },
  { id: "A2", who: "Honest-but-curious server", goal: "Infer whether a patient was in a hospital's training set (membership inference)", defence: `DP noise; measured attack AUC ${MIA_AUC.min}–${MIA_AUC.max}`, status: "Near chance, but formal ε is weak" },
  { id: "A3", who: "Malicious hospital", goal: "Send poisoned updates to bias the model", defence: "Not defended yet (future: robust aggregation)", status: "Open" },
  { id: "A4", who: "Unauthorised dashboard user", goal: "Access predictions or model data", defence: "Sign-in with hashed passwords and session cookies (better-auth); each user sees only their own risk checks", status: "Implemented, not formally evaluated" },
];

function HowItWorksPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="How it works"
          subtitle="Hospitals can't share patient records, and one hospital alone has too little data. Federated learning sends the model to the data instead of the data to the model."
        />

        <Panel title="One training round, step by step">
          <FedAvgAnimation />
        </Panel>

        <div className="grid lg:grid-cols-2 gap-4">
          <Panel title="In plain words">
            <div className="space-y-3 text-sm text-ink-600 leading-relaxed">
              <p>Think of a teacher who sends a draft "exam tips" booklet to three classrooms. Each class improves the booklet using its own private notebooks and sends back only the booklet. The teacher averages the returned booklets and sends the new version out again.</p>
              <p>Here the booklet is the model's weights, the classrooms are hospitals, and the notebooks are patient records. After {FEDERATION.rounds} rounds the shared model predicts diabetes and heart disease better than any single hospital's model.</p>
              <p>Even updates can leak a little, so each one is clipped and noise is added (differential privacy). The paper measures an actual attack and reports the formal privacy budget honestly.</p>
            </div>
          </Panel>
          <Panel title="Two different tools on this site">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-ink-900">Federated model (Dashboard, Models, Privacy)</p>
                <p className="text-ink-600 mt-1">Logistic regression trained with FedAvg on UCI data. Its accuracy (74.5% diabetes, 80.0% heart) is what the paper reports.</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900">Clinical risk check (Risk check, History)</p>
                <p className="text-ink-600 mt-1">A separate, rule-based triage score with guideline thresholds (JNC 7, NCEP ATP III, ADA, WHO). Every point can be traced by hand. It is not the federated model.</p>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Threat model" subtitle="Who might attack the system and what defends against them (Sec. IV.B)">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                  <th className="py-2 px-2">ID</th><th className="py-2 px-2">Adversary</th><th className="py-2 px-2">Goal</th><th className="py-2 px-2">Defence</th><th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((t) => (
                  <tr key={t.id} className="border-b border-ink-50 align-top">
                    <td className="py-2.5 px-2 font-mono font-semibold text-medical-600">{t.id}</td>
                    <td className="py-2.5 px-2 font-medium text-ink-900">{t.who}</td>
                    <td className="py-2.5 px-2 text-ink-600">{t.goal}</td>
                    <td className="py-2.5 px-2 text-ink-600">{t.defence}</td>
                    <td className="py-2.5 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${t.status === "Mitigated" ? "bg-safety-500/10 border-safety-500/30 text-safety-600" : t.status === "Open" ? "bg-red-50 border-red-200 text-red-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppLayout>
  );
}
