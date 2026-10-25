import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, PageHeader, Panel } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { Plus, MapPin, Server, Trash2, Loader2, Lock, Info } from "lucide-react";
import { getNodes, createNode, deleteNode } from "@/lib/server-fns";
import { Modal } from "@/components/ui/Modal";
import { DATASETS, FEDERATION } from "@/lib/paper-data";

export const Route = createFileRoute("/nodes")({
  component: NodesPage,
});

const emptyForm = { name: "", location: "", country: "", patientCount: "" };

function NodesPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => getNodes().then(setNodes);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createNode({ data: { name: form.name, location: form.location, country: form.country, patientCount: form.patientCount ? Number(form.patientCount) : undefined } });
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err?.message?.includes("session") ? err.message : "Check the fields: names need at least 2 characters.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteNode({ data: { id: deleteId } }).catch(() => null);
    setDeleteId(null);
    load();
  };

  const paper = nodes.filter((n) => n.source === "paper");
  const added = nodes.filter((n) => n.source !== "paper");

  const card = (node: any) => (
    <div key={node.id} className="bg-white rounded-2xl border border-ink-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-ink-950 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-medical-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-950 truncate">{node.name}</h3>
            <div className="flex items-center gap-1 text-xs text-ink-500 mt-0.5"><MapPin className="w-3 h-3" /> {node.location}{node.country && node.country !== "Simulated" ? `, ${node.country}` : ""}</div>
          </div>
        </div>
        {node.source === "paper" ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ink-100 text-ink-600 text-[11px] font-semibold"><Lock className="w-3 h-3" /> Paper</span>
        ) : (
          <button onClick={() => setDeleteId(node.id)} aria-label={`Remove ${node.name}`} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-ink-400">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-ink-50">
          <div className="text-ink-500">Status</div>
          <div className="font-semibold text-ink-900 flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-safety-500" /> {node.source === "paper" ? "Took part in all 20 rounds" : "Registered"}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-ink-50">
          <div className="text-ink-500">Patient records</div>
          <div className="font-semibold text-ink-900 mt-0.5 tabular-nums">{node.patientCount != null ? node.patientCount.toLocaleString() : "Not reported"}</div>
        </div>
      </div>
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Hospitals"
          subtitle={`The federation in the paper has ${FEDERATION.hospitals} simulated hospitals. Each keeps its share of the data locally and only sends model updates.`}
          action={
            <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 text-sm">
              <Plus className="w-4 h-4" /> Add hospital
            </button>
          }
        />

        <div className="flex items-start gap-3 p-4 rounded-xl bg-medical-500/5 border border-medical-500/20 text-sm text-medical-700">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            {DATASETS.diabetes.records} {DATASETS.diabetes.name} and {DATASETS.heart.records} {DATASETS.heart.name} records were split non-IID (unevenly) across the three hospitals, with every record kept. The paper does not list exact per-hospital counts, so they are shown as "Not reported". In FedAvg each hospital's weight is its share of the records (Eq. 2).
          </span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{paper.map(card)}</div>

        <Panel title="Hospitals added by users" subtitle="Registered from this dashboard; they did not take part in the paper's experiment">
          {added.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{added.map(card)}</div> : <p className="text-sm text-ink-500">None yet. Use "Add hospital" to register one.</p>}
        </Panel>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm); setError(""); }} title="Add a hospital">
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { label: "Hospital name", key: "name", placeholder: "e.g. Hospital D", required: true, type: "text" },
            { label: "City", key: "location", placeholder: "e.g. Ghaziabad", required: true, type: "text" },
            { label: "Country", key: "country", placeholder: "e.g. India", required: true, type: "text" },
            { label: "Patient records (optional)", key: "patientCount", placeholder: "e.g. 250", required: false, type: "number" },
          ].map(({ label, key, placeholder, required, type }) => (
            <div key={key}>
              <label htmlFor={`node-${key}`} className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">{label}</label>
              <input id={`node-${key}`} type={type} required={required} value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className={inputCls} />
            </div>
          ))}
          {error && <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 text-sm disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : <><Plus className="w-4 h-4" /> Add hospital</>}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove hospital">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">Remove this hospital from the list? This deletes it from the database.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50">Cancel</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 text-sm">Remove</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
