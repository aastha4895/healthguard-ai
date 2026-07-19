import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import {
  Plus, Search, MapPin, Wifi, WifiOff, RefreshCw,
  Trash2, Server, Clock, Database, Loader2,
} from "lucide-react";
import { getNodes, createNode } from "@/lib/server-fns";
import { Modal } from "@/components/ui/Modal";

export const Route = createFileRoute("/nodes")({
  component: NodesPage,
});

const statusConfig = {
  online: { label: "Online", dot: "bg-safety-500", text: "text-safety-600", bg: "bg-safety-500/10 border-safety-500/20" },
  syncing: { label: "Syncing", dot: "bg-amber-400 animate-pulse", text: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  offline: { label: "Offline", dot: "bg-ink-300", text: "text-ink-500", bg: "bg-ink-100 border-ink-200" },
};

const emptyForm = { name: "", location: "", country: "", ipAddress: "", patientCount: "" };

function NodesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "syncing" | "offline">("all");
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => getNodes().then(setAllNodes);
  useEffect(() => { load(); }, []);

  const filtered = allNodes.filter((n) => {
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || n.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    online: allNodes.filter((n) => n.status === "online").length,
    syncing: allNodes.filter((n) => n.status === "syncing").length,
    offline: allNodes.filter((n) => n.status === "offline").length,
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createNode({
      data: {
        name: form.name,
        location: form.location,
        country: form.country,
        ipAddress: form.ipAddress || undefined,
        patientCount: form.patientCount ? Number(form.patientCount) : undefined,
      },
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  };

  const handleDelete = (id: string) => {
    // Optimistic UI — remove from list (DB delete wired in Phase 4 server fn)
    setAllNodes((prev) => prev.filter((n) => n.id !== id));
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-950">Hospital Nodes</h1>
            <p className="text-sm text-ink-500 mt-1">{allNodes.length} registered nodes · {counts.online} online</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors text-sm shadow-lg shadow-medical-500/20"
          >
            <Plus className="w-4 h-4" /> Add Node
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {(["online", "syncing", "offline"] as const).map((s) => {
            const c = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "all" : s)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filter === s ? "ring-2 ring-medical-400 border-medical-300" : "border-ink-200 bg-white hover:border-medical-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{c.label}</span>
                </div>
                <div className="text-3xl font-bold text-ink-950">{counts[s]}</div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search nodes by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent"
          />
        </div>

        {/* Node cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((node) => {
            const c = statusConfig[node.status as keyof typeof statusConfig] ?? statusConfig.offline;
            return (
              <div key={node.id} className={`bg-white rounded-2xl border border-ink-200 p-5 hover:border-medical-300 hover:shadow-md transition-all ${node.status === "offline" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-950 flex items-center justify-center shrink-0">
                      <Server className="w-5 h-5 text-medical-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-950 text-sm">{node.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-ink-400 mt-0.5">
                        <MapPin className="w-3 h-3" /> {node.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {c.label}
                    </span>
                    <button
                      onClick={() => setDeleteId(node.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-ink-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <Wifi className="w-3.5 h-3.5 text-ink-400" />
                    <span>Latency: <span className="font-mono font-semibold text-ink-700">{node.latency ?? "—"}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <Clock className="w-3.5 h-3.5 text-ink-400" />
                    <span>Updated: <span className="font-semibold text-ink-700">{new Date(node.updatedAt).toLocaleDateString()}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <Database className="w-3.5 h-3.5 text-ink-400" />
                    <span>Data: <span className="font-mono font-semibold text-ink-700">{node.dataSize ?? "—"}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <RefreshCw className="w-3.5 h-3.5 text-ink-400" />
                    <span>Contrib: <span className="font-semibold text-ink-700">{node.contribution ?? 0}%</span></span>
                  </div>
                </div>

                {(node.contribution ?? 0) > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full bg-ink-100 rounded-full overflow-hidden">
                      <div className="h-full bg-medical-500 rounded-full" style={{ width: `${(node.contribution ?? 0) * 5}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-ink-400">{node.ipAddress ?? "—"}</span>
                  <span className="text-[11px] text-ink-400">{(node.patientCount ?? 0).toLocaleString()} patients</span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-400">
            <WifiOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No nodes found</p>
          </div>
        )}
      </div>

      {/* Add Node Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm); }} title="Add Hospital Node">
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { label: "Hospital Name", key: "name", placeholder: "e.g. Stanford Medical Center", required: true },
            { label: "Location", key: "location", placeholder: "e.g. Stanford, CA, US", required: true },
            { label: "Country", key: "country", placeholder: "e.g. United States", required: true },
            { label: "Node IP Address", key: "ipAddress", placeholder: "e.g. 10.0.1.50", required: false },
            { label: "Approx. Patient Records", key: "patientCount", placeholder: "e.g. 8000", required: false },
          ].map(({ label, key, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                required={required}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors text-sm disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Node</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Node">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">Are you sure you want to remove this node from the federation? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-semibold text-sm hover:bg-ink-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors text-sm">
              Remove Node
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
