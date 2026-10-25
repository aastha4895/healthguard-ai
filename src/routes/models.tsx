import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel, SourceNote } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { BrainCircuit, Plus, Trash2, Loader2, Lock, Shield } from "lucide-react";
import { getModels, createModel, deleteModel } from "@/lib/server-fns";
import { Modal } from "@/components/ui/Modal";
import { ACCURACY, FEDERATED_GAIN, SIGNIFICANCE } from "@/lib/paper-data";

export const Route = createFileRoute("/models")({
  component: ModelsPage,
});

// Paper metrics per disease (Tables V and VI)
const PAPER_METRICS: Record<string, { acc: (typeof ACCURACY)[keyof typeof ACCURACY]; gain: number; pVsNoDp: number }> = {
  Diabetes: { acc: ACCURACY.diabetes, gain: FEDERATED_GAIN.diabetes, pVsNoDp: SIGNIFICANCE.diabetes.vsNoDp.p },
  "Heart Disease": { acc: ACCURACY.heart, gain: FEDERATED_GAIN.heart, pVsNoDp: SIGNIFICANCE.heart.vsNoDp.p },
};

const emptyForm = { name: "", description: "", disease: "Diabetes", totalRounds: "20" };

function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => getModels().then(setModels);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createModel({ data: { name: form.name, description: form.description || undefined, disease: form.disease, totalRounds: Number(form.totalRounds) || 20 } });
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err?.message?.includes("session") ? err.message : "Check the fields: the name needs at least 2 characters and rounds must be 1–1000.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteModel({ data: { id: deleteId } }).catch(() => null);
    setDeleteId(null);
    load();
  };

  const paper = models.filter((m) => m.source === "paper");
  const planned = models.filter((m) => m.source !== "paper");
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Models"
          subtitle="Logistic-regression models trained with FedAvg and differential privacy. Accuracies are 5-seed averages from the paper."
          action={
            <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 text-sm">
              <Plus className="w-4 h-4" /> Plan a model
            </button>
          }
        />

        <div className="grid lg:grid-cols-2 gap-4">
          {paper.map((m) => {
            const pm = PAPER_METRICS[m.disease];
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-ink-200 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-950 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-5 h-5 text-medical-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink-950">{m.name}</h3>
                      <p className="text-sm text-ink-500 mt-1">{m.description}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-safety-500/10 text-safety-600 text-[11px] font-semibold shrink-0"><Lock className="w-3 h-3" /> Completed</span>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs text-ink-500 mb-1.5"><span>Training</span><span className="font-semibold text-ink-700 tabular-nums">Round {m.currentRound} / {m.totalRounds}</span></div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden"><div className="h-full bg-safety-500" style={{ width: "100%" }} /></div>
                </div>

                {pm && (
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {[
                      { label: "One hospital", value: `${pm.acc.singleHospital}%` },
                      { label: "Federated, no DP", value: `${pm.acc.federatedNoDp}%` },
                      { label: "Federated, σ 0.05", value: `${pm.acc.federatedDp.mean.toFixed(1)}%` },
                      { label: "Gain", value: `+${pm.gain} pts` },
                    ].map((x) => (
                      <div key={x.label} className="p-2.5 rounded-xl bg-ink-50 border border-ink-100">
                        <div className="text-[10px] text-ink-500 uppercase tracking-wider">{x.label}</div>
                        <div className="font-bold text-ink-900 text-sm tabular-nums mt-1">{x.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-ink-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> ε ≈ {Number(m.privacyBudget).toLocaleString()} at σ = 0.05</span>
                  <span>{m.nodeCount} hospitals</span>
                  {pm && <span>± {pm.acc.federatedDp.std} across seeds · vs no DP p = {pm.pVsNoDp}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <SourceNote>Tables III, V and VI; paired t-tests in Sec. V.B. Light noise (σ = 0.05) costs no significant accuracy but gives no meaningful formal ε.</SourceNote>

        <Panel title="Planned models" subtitle="Ideas registered by users. They have not been trained.">
          {planned.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {planned.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-ink-200 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900">{m.name}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{m.disease} · {m.totalRounds} rounds planned</div>
                    {m.description && <p className="text-sm text-ink-600 mt-2">{m.description}</p>}
                  </div>
                  <button onClick={() => setDeleteId(m.id)} aria-label={`Delete ${m.name}`} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-ink-400 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">None yet.</p>
          )}
        </Panel>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm); setError(""); }} title="Plan a model">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="m-name" className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Name</label>
            <input id="m-name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Diabetes · FedProx" className={inputCls} />
          </div>
          <div>
            <label htmlFor="m-disease" className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Disease</label>
            <select id="m-disease" value={form.disease} onChange={(e) => setForm((p) => ({ ...p, disease: e.target.value }))} className={inputCls}>
              {["Diabetes", "Heart Disease", "Other"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="m-desc" className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Description</label>
            <textarea id="m-desc" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="What should it predict, and from which data?" className={inputCls + " resize-none"} />
          </div>
          <div>
            <label htmlFor="m-rounds" className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Planned rounds</label>
            <input id="m-rounds" type="number" min={1} max={1000} value={form.totalRounds} onChange={(e) => setForm((p) => ({ ...p, totalRounds: e.target.value }))} className={inputCls} />
          </div>
          {error && <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 text-sm disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Plus className="w-4 h-4" /> Save plan</>}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete planned model">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">Delete this planned model from the database?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50">Cancel</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 text-sm">Delete</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
