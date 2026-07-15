import { createFileRoute } from "@tanstack/react-router";
import networkTopology from "@/assets/network-topology.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 font-sans antialiased">
      <Nav />
      <Hero />
      <DashboardSection />
      <HowItWorks />
      <PrivacyPillars />
      <NetworkStats />
      <CTA />
      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center shadow-lg shadow-medical-500/30">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"
          />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-safety-500 rounded-full ring-2 ring-ink-50" />
      </div>
      <span className="font-bold text-xl tracking-tight text-ink-950">OmniNode</span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="border-b border-ink-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-600">
          <a href="#protocol" className="hover:text-ink-950 transition-colors">
            Protocol
          </a>
          <a href="#network" className="hover:text-ink-950 transition-colors">
            Network
          </a>
          <a href="#security" className="hover:text-ink-950 transition-colors">
            Security
          </a>
          <a href="#research" className="hover:text-ink-950 transition-colors">
            Research
          </a>
          <button className="bg-ink-950 text-white px-5 py-2 rounded-full hover:bg-ink-700 transition-colors font-semibold">
            Launch Node
          </button>
        </div>
      </div>
    </nav>
  );
}

function LiveBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-600 text-xs font-bold uppercase tracking-wider">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-500" />
      </span>
      {label}
    </div>
  );
}

function Hero() {
  return (
    <header className="pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <LiveBadge label="Secure Aggregation Active" />
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold text-ink-950 tracking-tight leading-[1.05] text-balance">
            Collective intelligence{" "}
            <span className="text-ink-400">without data exposure.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-600 leading-relaxed max-w-2xl">
            Train world-class disease prediction models across hospital networks.
            Patient data never leaves your firewall. Secured by FedAvg, Differential
            Privacy, and TLS-encrypted aggregation.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button className="px-7 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-all shadow-lg shadow-medical-500/25 hover:shadow-xl hover:shadow-medical-500/30 hover:-translate-y-0.5">
              Initialize Federated Cycle
            </button>
            <button className="px-7 py-3.5 bg-white border border-ink-200 text-ink-700 font-semibold rounded-xl hover:bg-ink-50 transition-colors">
              View Protocol Whitepaper
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl">
            <Stat value="14" label="Hospital nodes" />
            <Stat value="412" label="Global rounds" />
            <Stat value="94.2%" label="Model accuracy" />
            <Stat value="0.045" label="Privacy ε" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-ink-950 tracking-tight">{value}</div>
      <div className="text-xs text-ink-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function DashboardSection() {
  return (
    <section id="network" className="px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-ink-200/60 border border-ink-200 overflow-hidden">
          <div className="p-6 border-b border-ink-100 flex flex-wrap items-center justify-between gap-4 bg-ink-50/50">
            <div>
              <h3 className="font-bold text-ink-950">Active Model: CardioRisk-v4</h3>
              <p className="text-sm text-ink-500">Global Training Round #412</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 bg-white rounded-lg border border-ink-200 text-sm">
                <span className="text-ink-400">Privacy Budget (ε):</span>{" "}
                <span className="font-mono font-semibold">0.045</span>
              </div>
              <div className="px-4 py-2 bg-safety-500/10 text-safety-600 rounded-lg border border-safety-500/20 text-sm font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-safety-500 rounded-full" />
                Secure Aggregation
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3">
            <aside className="border-b md:border-b-0 md:border-r border-ink-100 p-6 space-y-6">
              <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest">
                Connected Nodes
              </h4>
              <ul className="space-y-4">
                <NodeRow name="Mayo Clinic" status="online" meta="0.4ms" />
                <NodeRow name="Cleveland Center" status="online" meta="1.2ms" />
                <NodeRow name="Johns Hopkins" status="syncing" meta="Syncing" />
                <NodeRow name="Berlin Charité" status="online" meta="18ms" />
                <NodeRow name="Karolinska Inst." status="online" meta="22ms" />
                <NodeRow name="Tokyo Med Univ." status="offline" meta="Offline" />
              </ul>

              <div className="pt-6 border-t border-ink-100 space-y-2">
                <div className="text-xs text-ink-500">Aggregation method</div>
                <div className="font-mono text-sm font-semibold text-ink-950">
                  Weighted FedAvg
                </div>
              </div>
            </aside>

            <div className="md:col-span-2 p-6 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <div className="text-4xl font-bold text-ink-950 tracking-tight">
                    94.2%
                  </div>
                  <div className="text-sm text-ink-500 mt-1">
                    Prediction Accuracy — Heart Disease
                  </div>
                </div>
                <div className="flex gap-1 items-end h-16">
                  {[40, 55, 62, 70, 78, 82, 88, 94].map((h, i) => (
                    <div
                      key={i}
                      className="w-2.5 bg-medical-500 rounded-t"
                      style={{
                        height: `${h}%`,
                        opacity: 0.2 + (i / 7) * 0.8,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-ink-950">
                <img
                  src={networkTopology}
                  alt="Federation network topology showing hospital nodes connecting to a central aggregation hub"
                  width={1600}
                  height={800}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-medical-400">
                    Network Topology · Live
                  </span>
                  <span className="w-1.5 h-1.5 bg-medical-400 rounded-full animate-pulse" />
                </div>
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1 font-mono text-[10px] text-ink-300">
                  <span>lat: 47.62°N</span>
                  <span>enc: TLS 1.3</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <Metric label="Gradient noise" value="0.002 σ" />
                <Metric label="Round latency" value="4.8s" />
                <Metric label="Loss (val)" value="0.184" />
                <Metric label="Participants" value="12 / 14" />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-ink-100 bg-ink-50/50">
            <PredictionDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeRow({
  name,
  status,
  meta,
}: {
  name: string;
  status: "online" | "syncing" | "offline";
  meta: string;
}) {
  const dot =
    status === "online"
      ? "bg-safety-500"
      : status === "syncing"
        ? "bg-amber-400 animate-pulse"
        : "bg-ink-300";
  const opacity = status === "offline" ? "opacity-50" : "";
  return (
    <li className={`flex items-center justify-between ${opacity}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <span className="text-sm font-medium truncate">{name}</span>
      </div>
      <span className="text-xs font-mono text-ink-400 shrink-0 ml-2">{meta}</span>
    </li>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-ink-100 bg-ink-50/50">
      <div className="text-[11px] text-ink-500 mb-1 uppercase tracking-wider">
        {label}
      </div>
      <div className="font-mono font-bold text-ink-900 text-sm">{value}</div>
    </div>
  );
}

function PredictionDemo() {
  return (
    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div className="flex flex-wrap gap-6">
        <DemoField label="Patient ID" value="PAT-772-BX" />
        <DemoField label="Age" value="58" />
        <DemoField label="BP (sys)" value="146" />
        <DemoField label="Cholesterol" value="238" />
        <DemoField label="Category" value="Cardiac Fibrosis" />
      </div>
      <div className="flex items-center gap-4 min-w-[220px]">
        <div className="flex-1">
          <div className="text-xs text-ink-500 mb-1 uppercase tracking-wider">
            Federated Prediction
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-medical-600">98.4%</span>
            <span className="text-xs text-ink-500">confidence</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-ink-200 rounded-full overflow-hidden">
            <div className="h-full bg-medical-500 rounded-full" style={{ width: "98.4%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-ink-900">{value}</div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Local Training",
      body: "Each hospital trains the shared model architecture on private clinical records. Data never leaves the firewall.",
    },
    {
      n: "02",
      title: "Differential Privacy",
      body: "Calibrated noise is injected into gradient updates, mathematically bounding individual patient re-identification risk.",
    },
    {
      n: "03",
      title: "FedAvg Aggregation",
      body: "The coordinator averages encrypted weight updates from all participating nodes into a global consensus model.",
    },
    {
      n: "04",
      title: "Global Dispatch",
      body: "The refined model is redistributed to every node, improving local diagnostic accuracy for the next round.",
    },
  ];
  return (
    <section id="protocol" className="px-6 py-24 border-t border-ink-200">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold text-medical-600 uppercase tracking-widest mb-4 font-mono">
            The Federation Protocol
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-950 tracking-tight text-balance">
            Orchestrating intelligence without exposure.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-mono text-4xl font-bold text-medical-500/30 mb-4">
                {s.n}
              </div>
              <h3 className="font-bold text-lg text-ink-950 mb-3">{s.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivacyPillars() {
  return (
    <section id="security" className="px-6 py-24 bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <div className="text-xs font-bold text-medical-400 uppercase tracking-widest mb-4 font-mono">
              Privacy Stack
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Clinical-grade guarantees at every layer.
            </h2>
            <p className="mt-6 text-ink-300 max-w-md">
              We exceed HIPAA and GDPR mandates with a multi-layered cryptographic
              approach — verified through independent security audits.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <ComplianceChip label="HIPAA" />
              <ComplianceChip label="GDPR" />
              <ComplianceChip label="SOC 2" />
              <ComplianceChip label="ISO 27001" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Pillar
              icon={<div className="w-5 h-5 border-2 border-medical-400 rounded-full" />}
              title="Differential Privacy"
              body="Mathematical proof that individual records cannot be reverse-engineered from global model weights."
            />
            <Pillar
              icon={
                <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                  <div className="bg-medical-400" />
                  <div className="bg-medical-400/30" />
                  <div className="bg-medical-400/30" />
                  <div className="bg-medical-400" />
                </div>
              }
              title="Secure Aggregation"
              body="Cryptographic MPC ensures the coordinator only sees the sum of updates — never raw hospital gradients."
            />
            <Pillar
              icon={<div className="w-5 h-2 bg-medical-400 rounded-full" />}
              title="TLS Everywhere"
              body="Mutual-TLS 1.3 secures every hop between hospital nodes and the aggregation server."
            />
            <Pillar
              icon={
                <div className="w-5 h-5 border-2 border-medical-400 rounded-sm rotate-45" />
              }
              title="Zero-Knowledge Hub"
              body="The orchestrator remains blind to local data distributions while achieving maximum convergence."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ComplianceChip({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono font-semibold tracking-wider">
      {label}
    </span>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-ink-300 leading-relaxed">{body}</p>
    </div>
  );
}

function NetworkStats() {
  return (
    <section id="research" className="px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <ResearchCard
            tag="Diabetes"
            headline="+38%"
            body="Improvement in early-onset detection sensitivity vs. locally-trained baselines across 8 partner sites."
          />
          <ResearchCard
            tag="Cardiac"
            headline="0.94 AUC"
            body="Federated CardioRisk-v4 outperforms every siloed model in cross-institutional validation."
          />
          <ResearchCard
            tag="Privacy"
            headline="ε = 0.045"
            body="Formal differential privacy budget maintained across all 412 training rounds. Audit-verified."
          />
        </div>
      </div>
    </section>
  );
}

function ResearchCard({
  tag,
  headline,
  body,
}: {
  tag: string;
  headline: string;
  body: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-ink-200 hover:border-medical-400 hover:shadow-xl hover:shadow-ink-200/60 transition-all">
      <div className="text-xs font-mono font-bold text-medical-600 uppercase tracking-widest mb-4">
        {tag}
      </div>
      <div className="text-5xl font-bold text-ink-950 tracking-tight mb-4">
        {headline}
      </div>
      <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}

function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto rounded-3xl bg-ink-950 text-white p-12 md:p-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-medical-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-safety-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <LiveBadge label="Onboarding Q3 partners" />
          <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-balance max-w-2xl">
            Ready to join the federation?
          </h2>
          <p className="mt-4 text-ink-300 max-w-xl">
            Fourteen leading institutions already train superior diagnostic models on
            our infrastructure. Bring your data — leave it exactly where it is.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="px-7 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors shadow-lg shadow-medical-500/30">
              Request a live demo
            </button>
            <button className="px-7 py-3.5 bg-white/5 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              Contact research team
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-200 px-6 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Logo />
          <span className="text-xs font-mono text-ink-500 uppercase tracking-widest">
            Privacy-first federated learning
          </span>
        </div>
        <div className="flex gap-6 text-xs font-mono uppercase tracking-widest text-ink-500">
          <a href="#" className="hover:text-ink-950 transition-colors">
            Security
          </a>
          <a href="#" className="hover:text-ink-950 transition-colors">
            Compliance
          </a>
          <a href="#" className="hover:text-ink-950 transition-colors">
            Ethics
          </a>
          <a href="#" className="hover:text-ink-950 transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
