import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel, SourceNote } from "@/components/layout/AppLayout";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ACCURACY, EPSILON_TABLE, FEDERATION, MIA_AUC, SIGMA_FOR_EPSILON_8, SIGMA_SWEEP, epsilonAfterRounds } from "@/lib/paper-data";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

// Accuracy is printed in the text only for these σ; the rest appear only in Fig. 3.
const reportedAccuracy: Record<number, { diabetes: string; heart: string }> = {
  0: { diabetes: `${ACCURACY.diabetes.federatedNoDp}%`, heart: `${ACCURACY.heart.federatedNoDp}%` },
  0.05: { diabetes: `${ACCURACY.diabetes.federatedDp.mean}% ± ${ACCURACY.diabetes.federatedDp.std}`, heart: `${ACCURACY.heart.federatedDp.mean.toFixed(1)}% ± ${ACCURACY.heart.federatedDp.std}` },
  2: { diabetes: `≈ ${ACCURACY.diabetes.federatedHeavyDp.mean}%`, heart: `≈ ${ACCURACY.heart.federatedHeavyDp.mean}%` },
};

const fmt = (e: number) => (e === Infinity ? "∞" : e >= 100 ? Math.round(e).toLocaleString() : e.toFixed(1));

function PrivacyPage() {
  const [idx, setIdx] = useState(1); // σ = 0.05, the paper's reference setting
  const sigma = SIGMA_SWEEP[idx];
  const table = EPSILON_TABLE.find((r) => r.sigma === sigma);
  const eps20 = epsilonAfterRounds(FEDERATION.rounds, sigma);
  const perRound = Array.from({ length: FEDERATION.rounds }, (_, i) => ({ round: i + 1, epsilon: Math.round(epsilonAfterRounds(i + 1, sigma) * 10) / 10 }));
  const acc = reportedAccuracy[sigma];
  const verdict = sigma === 0 ? "No noise, so no formal guarantee at all." : eps20 > 100 ? "Effectively no formal guarantee." : eps20 > 8 ? "Weak guarantee; still far above ε ≈ 8." : "Meaningful guarantee.";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Privacy budget"
          subtitle={`Each hospital's update is clipped to C = ${FEDERATION.clipNorm.toFixed(1)} and Gaussian noise with scale σ is added, once per round. Rényi-DP accounting (δ = 10⁻⁵, client-level) converts σ into a formal (ε, δ) guarantee. Smaller ε means stronger privacy.`}
        />

        <Panel title="Choose a noise level σ" subtitle="The seven levels tested in the paper">
          <input
            id="sigma"
            type="range"
            min={0}
            max={SIGMA_SWEEP.length - 1}
            step={1}
            value={idx}
            onChange={(e) => setIdx(Number(e.target.value))}
            className="w-full accent-[oklch(0.62_0.14_195)]"
            aria-label="Noise level sigma"
          />
          <div className="flex justify-between text-xs text-ink-500 tabular-nums mt-1">
            {SIGMA_SWEEP.map((s, i) => (
              <button key={s} onClick={() => setIdx(i)} className={`px-1.5 py-0.5 rounded ${i === idx ? "bg-medical-500 text-white font-semibold" : "hover:bg-ink-100"}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs text-ink-500 tracking-wider">ε after {FEDERATION.rounds} rounds</div>
              <div className="text-3xl font-bold text-ink-950 tabular-nums mt-1">{fmt(table?.epsilon ?? eps20)}</div>
              <div className="text-xs text-ink-500 mt-1">{table ? `Table III · closed form ${fmt(eps20)}` : sigma === 0 ? "σ = 0" : ""}</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs text-ink-500 uppercase tracking-wider">Diabetes accuracy</div>
              <div className="text-2xl font-bold text-ink-950 tabular-nums mt-1">{acc?.diabetes ?? "—"}</div>
              <div className="text-xs text-ink-500 mt-1">{acc ? "Reported in the text" : "Shown only in Fig. 3"}</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs text-ink-500 uppercase tracking-wider">Heart accuracy</div>
              <div className="text-2xl font-bold text-ink-950 tabular-nums mt-1">{acc?.heart ?? "—"}</div>
              <div className="text-xs text-ink-500 mt-1">{acc ? "Reported in the text" : "Shown only in Fig. 3"}</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs text-ink-500 uppercase tracking-wider">Attack AUC</div>
              <div className="text-2xl font-bold text-ink-950 tabular-nums mt-1">{MIA_AUC.min}–{MIA_AUC.max}</div>
              <div className="text-xs text-ink-500 mt-1">Same at every σ (0.50 = guessing)</div>
            </div>
          </div>
          <p className={`mt-4 text-sm font-semibold ${eps20 > 8 ? "text-amber-600" : "text-safety-600"}`}>{verdict}</p>
        </Panel>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
          <Panel title={`Cumulative ε by round at σ = ${sigma}`} subtitle="ε(r) = r / (2z²) + √(2r·ln(1/δ)) / z,  z = σ / C   (Eq. 8)">
            {sigma === 0 ? (
              <p className="text-sm text-ink-500 py-16 text-center">With σ = 0 no noise is added, so ε is unbounded from the first round.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perRound} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="oklch(0.929 0.013 255)" />
                    <XAxis dataKey="round" tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257)" }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                    <Tooltip formatter={(v) => [fmt(Number(v)), "ε"]} labelFormatter={(r) => `Round ${r}`} />
                    <ReferenceLine y={8} stroke="oklch(0.72 0.17 160)" strokeDasharray="4 4" label={{ value: "ε = 8", position: "insideTopLeft", fontSize: 11, fill: "oklch(0.63 0.16 160)" }} />
                    <Line isAnimationActive={false} type="monotone" dataKey="epsilon" stroke="oklch(0.62 0.14 195)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <SourceNote>Sec. IV.F. The closed form is slightly tighter than Table III at σ = 0.05 because Table III uses a discrete grid of Rényi orders.</SourceNote>
          </Panel>

          <Panel title="Table III · formal ε at T = 20">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-left text-xs text-ink-500 border-b border-ink-100">
                  <th className="py-2">σ</th><th className="py-2">z = σ/C</th><th className="py-2 text-right">ε</th>
                </tr>
              </thead>
              <tbody>
                {EPSILON_TABLE.map((r) => (
                  <tr key={r.sigma} className={`border-b border-ink-50 ${r.sigma === sigma ? "bg-medical-50 font-semibold" : ""}`}>
                    <td className="py-2">{r.sigma}</td><td className="py-2">{r.z}</td><td className="py-2 text-right">{r.epsilon.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              A conventional budget of ε ≈ 8 over 20 rounds would need σ ≈ {SIGMA_FOR_EPSILON_8} ({fmt(epsilonAfterRounds(20, SIGMA_FOR_EPSILON_8))} by Eq. 8), more than four times the largest level tested.
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
