import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldPlus, ArrowRight, Lock, Network, ScanSearch, Calculator, ChevronRight, Database } from "lucide-react";
import { useState, useEffect } from "react";
import { ACCURACY, DATASETS, FEDERATED_GAIN, FEDERATION, MIA_AUC } from "@/lib/paper-data";

export const Route = createFileRoute("/")(({
  component: LandingPage,
}));

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink-900 font-sans antialiased">
      <Nav />
      <Hero />
      <EvaluatedOn />
      <HowItWorks />
      <PrivacyPillars />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center shadow-lg shadow-medical-500/30">
        <ShieldPlus className="w-4 h-4 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-safety-500 rounded-full ring-2 ring-ink-50" />
      </div>
      <span className="font-bold text-xl tracking-tight text-ink-950">HealthGuard AI</span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="border-b border-ink-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-500">
          <a href="#how-it-works" className="hover:text-ink-950 transition-colors">How It Works</a>
          <a href="#security" className="hover:text-ink-950 transition-colors">Security</a>
          <a href="#stats" className="hover:text-ink-950 transition-colors">Research</a>
          <Link to="/login" className="hover:text-ink-950 transition-colors">Login</Link>
          <Link
            to="/register"
            className="bg-medical-500 text-white px-5 py-2 rounded-full hover:bg-medical-600 transition-colors font-semibold shadow-md shadow-medical-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function LiveBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-500/10 border border-medical-500/20 text-medical-700 text-xs font-bold uppercase tracking-wider">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-500" />
      </span>
      {label}
    </div>
  );
}

function EKGLine() {
  return (
    <svg viewBox="0 0 600 60" className="w-full h-10 text-medical-500" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 30 L120 30 L140 30 L150 10 L165 50 L180 20 L195 40 L210 30 L340 30 L355 15 L370 45 L385 30 L600 30"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

const floatingChips = [
  { label: "Federated Learning",   top: "8%",  right: "4%",  delay: "0s",    duration: "4s"  },
  { label: "Differential Privacy", top: "42%", right: "2%",  delay: "1.6s",  duration: "3.8s"},
  { label: "TLS Encrypted",       top: "60%", right: "14%", delay: "0.4s",  duration: "4.5s"},
  { label: "Records Stay Local",  top: "75%", right: "5%",  delay: "1.2s",  duration: "5.2s"},
  { label: "FedAvg Aggregation",  top: "14%", right: "32%", delay: "2s",    duration: "4.2s"},
];

function FloatingChips() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <>
      {floatingChips.map((chip, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-default select-none transition-all duration-300"
          style={{
            top: chip.top,
            right: chip.right,
            animation: `float-y ${chip.duration} ease-in-out ${chip.delay} infinite`,
            background: hovered === i ? "oklch(0.62 0.14 195 / 0.12)" : "white",
            borderColor: hovered === i ? "oklch(0.62 0.14 195 / 0.5)" : "oklch(0.929 0.013 255)",
            color: hovered === i ? "oklch(0.44 0.11 200)" : "oklch(0.554 0.046 257)",
            boxShadow: hovered === i
              ? "0 0 16px oklch(0.62 0.14 195 / 0.25), 0 2px 8px oklch(0 0 0 / 0.08)"
              : "0 1px 4px oklch(0 0 0 / 0.06)",
            transform: hovered === i ? "scale(1.08)" : undefined,
            zIndex: hovered === i ? 10 : 1,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: hovered === i ? "oklch(0.62 0.14 195)" : "oklch(0.72 0.13 195)" }}
          />
          {chip.label}
        </div>
      ))}
    </>
  );
}

function Hero() {
  return (
    <header className="pt-24 pb-20 px-6 bg-white relative overflow-hidden">
      <FloatingChips />
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <LiveBadge label="Research prototype · real UCI data" />
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold text-ink-950 tracking-tight leading-[1.05] text-balance">
            Smarter care.{" "}
            <span className="text-medical-500">Records stay local.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-500 leading-relaxed max-w-2xl">
            HealthGuard AI lets hospitals jointly train diabetes and heart-disease predictors.
            Raw patient records stay at each hospital. Only clipped, noise-protected model updates
            are shared, over TLS.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-all shadow-lg shadow-medical-500/25 hover:shadow-xl hover:-translate-y-0.5"
            >
              Create demo account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-ink-200 text-ink-700 font-semibold rounded-xl hover:bg-ink-50 hover:border-ink-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-14 max-w-2xl opacity-40">
            <EKGLine />
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl">
            <Stat value={String(FEDERATION.hospitals)} label="Simulated hospitals" />
            <Stat value={String(FEDERATION.rounds)} label="Training rounds" />
            <Stat value={`${ACCURACY.diabetes.federatedDp.mean}%`} label="Diabetes accuracy" />
            <Stat value={`${ACCURACY.heart.federatedDp.mean.toFixed(1)}%`} label="Heart accuracy" />
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l-2 border-medical-200 pl-4">
      <div className="text-2xl font-bold text-ink-950 tracking-tight">{value}</div>
      <div className="text-xs text-ink-400 mt-1 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

const evaluationFacts = [
  `${DATASETS.diabetes.name} · ${DATASETS.diabetes.records} records`,
  `${DATASETS.heart.name} · ${DATASETS.heart.records} records`,
  `${FEDERATION.hospitals} non-IID hospitals`,
  `${FEDERATION.seeds} random seeds`,
];

function EvaluatedOn() {
  return (
    <section className="py-12 border-y border-ink-100 bg-ink-50/50">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest">
          Evaluated on
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-4">
        {evaluationFacts.map((fact) => (
          <div
            key={fact}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white border border-ink-100 shadow-sm"
          >
            <div className="w-6 h-6 rounded-md bg-medical-500/10 flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5 text-medical-500" />
            </div>
            <span className="text-sm font-semibold text-ink-700">{fact}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Local Training", body: "Each hospital trains the shared model on private clinical records. Raw records never leave the hospital." },
    { n: "02", title: "Differential Privacy", body: "Calibrated noise is injected into gradient updates, limiting how much any single update can reveal." },
    { n: "03", title: "FedAvg Aggregation", body: "The server averages the updates, weighted by each hospital's number of patients, into one global model." },
    { n: "04", title: "Global Dispatch", body: `The refined model is redistributed to every node for the next round (${FEDERATION.rounds} rounds in total).` },
  ];
  return (
    <section id="how-it-works" className="px-6 py-24 border-t border-ink-200">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold text-medical-600 uppercase tracking-widest mb-4 font-mono">The Protocol</div>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-950 tracking-tight text-balance">
            Learn together, keep records local.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-mono text-4xl font-bold text-medical-500/30 mb-4">{s.n}</div>
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
  const pillars = [
    { icon: Lock, title: "Differential Privacy", body: `Each hospital's update is clipped to norm C = ${FEDERATION.clipNorm.toFixed(1)} and Gaussian noise is added before it is shared.` },
    { icon: ScanSearch, title: "Measured, not assumed", body: `A membership-inference attack scored AUC ${MIA_AUC.min}–${MIA_AUC.max}, close to a coin toss (0.50), at every noise level tested.` },
    { icon: Calculator, title: "Honest accounting", body: "The formal ε is derived with Rényi DP and reported for every noise level, including where the guarantee is weak." },
    { icon: Network, title: "TLS", body: "Model updates are encrypted in transit between each hospital and the aggregation server." },
  ];
  return (
    <section id="security" className="px-6 py-24 bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <div className="text-xs font-bold text-medical-400 uppercase tracking-widest mb-4 font-mono">Privacy Stack</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Privacy, measured honestly.
            </h2>
            <p className="mt-6 text-ink-300 max-w-md">
              Our threat model covers four adversaries (A1–A4). We state clearly what is and isn't defended.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-medical-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-ink-300 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const cards = [
    { tag: "Diabetes", headline: `+${FEDERATED_GAIN.diabetes} pts`, body: `Accuracy rose from ${ACCURACY.diabetes.singleHospital}% (single hospital) to ${ACCURACY.diabetes.federatedDp.mean}% (federated, σ = ${ACCURACY.diabetes.federatedDp.sigma}).` },
    { tag: "Heart disease", headline: `+${FEDERATED_GAIN.heart} pts`, body: `Accuracy rose from ${ACCURACY.heart.singleHospital}% (single hospital) to ${ACCURACY.heart.federatedDp.mean.toFixed(1)}% (federated, σ = ${ACCURACY.heart.federatedDp.sigma}).` },
    { tag: "Privacy", headline: `AUC ${MIA_AUC.min}–${MIA_AUC.max}`, body: "The attack stayed near chance. The formal ε is large at noise levels that keep accuracy useful, and we report that honestly." },
  ];
  return (
    <section id="stats" className="px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-medical-600 uppercase tracking-widest mb-4 font-mono">Research Outcomes</div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink-950 tracking-tight">Results on real UCI data.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map(({ tag, headline, body }) => (
            <div key={tag} className="p-8 rounded-2xl bg-white border border-ink-200 hover:border-medical-400 hover:shadow-xl transition-all">
              <div className="text-xs font-mono font-bold text-medical-600 uppercase tracking-widest mb-4">{tag}</div>
              <div className="text-5xl font-bold text-ink-950 tracking-tight mb-4">{headline}</div>
              <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto rounded-3xl bg-ink-950 text-white p-12 md:p-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-medical-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-safety-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance max-w-2xl">
            Explore the dashboard.
          </h2>
          <p className="mt-4 text-ink-300 max-w-xl">
            A research prototype by ABES Institute of Technology, Ghaziabad. Try the dashboard with a demo account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors shadow-lg shadow-medical-500/30"
            >
              Create demo account <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 bg-white/5 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
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
          <span className="text-xs font-mono text-ink-500 uppercase tracking-widest">Privacy-first federated learning</span>
        </div>
        <div className="flex gap-6 text-xs font-mono uppercase tracking-widest text-ink-500">
          {["Security", "Contact"].map((l) => (
            <a key={l} href="#" className="hover:text-ink-950 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
