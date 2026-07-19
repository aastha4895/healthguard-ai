import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import {
  BrainCircuit, Plus, Play, Pause, CheckCircle,
  Clock, BarChart2, Shield, ChevronRight, Search, Trash2, Loader2,
} from "lucide-react";
import { getModels, createModel } from "@/lib/server-fns";
import { Modal } from "@/components/ui/Modal";

export const Route = createFileRoute("/models")({
  component: ModelsPage,
});

const statusConfig = {
  training: { label: "Training", icon: Play, color: "text-medical-600", bg: "bg-medical-500/10 border-medical-500/20", dot: "bg-medical-500 animate-pulse" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-safety-600", bg: "bg-safety-500/10 border-safety-500/20", dot: "bg-safety-500" },
  paused: { label: "Paused", icon: Pause, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400" },
};

const diseaseColors: Record<string, string> = {
  Cardiac: "bg-red-50 text-red-600 border-red-200",
  Diabetes: "bg-blue-50 text-blue-600 border-blue-200",
  Neurology: "bg-purple-50 text-purple-600 border-purple-200",
  "Critical Care": "bg-orange-50 text-orange-600 border-orange-200",
  Oncology: "bg-pink-50 text-pink-600 border-pink-200",
  Other: "bg-ink-50 text-ink-600 border-ink-200",
};

const emptyForm = { name: "", description: "", disease: "Cardiac", totalRounds: "500" };

function ModelsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "training" | "completed" | "paused">("all");
  const [allModels, setAllModels] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => getModels().then(setAllModels);
  useEffect(() => { load(); }, []);

  const filtered = allModels.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.disease ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createModel({
      data: {
        name: form.name,
        description: form.description || undefined,
        disease: form.disease,
        totalRounds: Number(form.totalRounds) || 500,
      },
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  };

  const handleDelete = (id: string) => {
    setAllModels((prev) => prev.filter((m) => m.id !== id));
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-950">Federated Models</h1>
            <p className="text-sm text-ink-500 mt-1">{allModels.length} models · {allModels.filter(m => m.status === "training").length} currently training</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors text-sm shadow-lg shadow-medical-500/20"
          >
            <Plus className="w-4 h-4" /> New Model
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "training", "completed", "paused"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                  filter === f ? "bg-ink-950 text-white" : "bg-white border border-ink-200 text-ink-600 hover:border-ink-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Model cards */}
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((model) => {
            const sc = statusConfig[model.status as keyof typeof statusConfig] ?? statusConfig.paused;
            const StatusIcon = sc.icon;
            const progress = Math.round(((model.currentRound ?? 0) / (model.totalRounds ?? 500)) * 100);
            const diseaseColor = diseaseColors[model.disease] ?? diseaseColors.Other;

            return (
              <div key={model.id} className="bg-white rounded-2xl border border-ink-200 p-6 hover:border-medical-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-950 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-5 h-5 text-medical-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink-950">{model.name}</h3>
                      <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${diseaseColor}`}>
                        {model.disease}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.bg} ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                    <button
                      onClick={() => setDeleteId(model.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-ink-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {model.description && (
                  <p className="text-sm text-ink-500 leading-relaxed mb-5">{model.description}</p>
                )}

                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
                    <span>Training Progress</span>
                    <span className="font-mono font-semibold text-ink-700">Round {model.currentRound ?? 0} / {model.totalRounds ?? 500}</span>
                  </div>
                  <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${model.status === "completed" ? "bg-safety-500" : "bg-medical-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] text-ink-400 mt-1">{progress}%</div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[
                    { label: "Accuracy", value: model.accuracy ? `${model.accuracy}%` : "—" },
                    { label: "AUC", value: model.auc ?? "—" },
                    { label: "Loss", value: model.loss ?? "—" },
                    { label: "Nodes", value: model.nodeCount ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-ink-50 border border-ink-100 text-center">
                      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">{label}</div>
                      <div className="font-mono font-bold text-ink-900 text-sm">{String(value)}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-ink-100">
                  <div className="flex items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" />ε = {model.privacyBudget ?? "—"}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(model.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-medical-600 hover:text-medical-700 transition-colors">
                    View details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-400">
            <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No models found</p>
          </div>
        )}
      </div>

      {/* Create Model Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm); }} title="Create Federated Model">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Model Name</label>
            <input required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. CardioRisk-v5"
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Disease Category</label>
            <select required value={form.disease} onChange={(e) => setForm(p => ({ ...p, disease: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent">
              {["Cardiac", "Diabetes", "Neurology", "Critical Care", "Oncology", "Other"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe what this model predicts..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">Total Training Rounds</label>
            <input type="number" value={form.totalRounds} onChange={(e) => setForm(p => ({ ...p, totalRounds: e.target.value }))}
              placeholder="500"
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors text-sm disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Model</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Model">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">Are you sure you want to delete this model? All training progress will be lost.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors text-sm">
              Delete Model
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
