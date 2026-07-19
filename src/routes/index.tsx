import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldPlus, ArrowRight, Lock, Network, Brain, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")(({
  component: LandingPage,
}));

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink-900 font-sans antialiased">
      <Nav />
      <Hero />
      <TrustedBy />
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
  { label: "HIPAA Compliant",      top: "22%", right: "18%", delay: "0.8s",  duration: "5s"  },
  { label: "ε-Differential Privacy", top: "42%", right: "2%",  delay: "1.6s",  duration: "3.8s"},
  { label: "TLS 1.3 Encrypted",   top: "60%", right: "14%", delay: "0.4s",  duration: "4.5s"},
  { label: "Zero Data Sharing",   top: "75%", right: "5%",  delay: "1.2s",  duration: "5.2s"},
  { label: "FedAvg Aggregation",  top: "14%", right: "32%", delay: "2s",    duration: "4.2s"},
  { label: "Secure MPC",          top: "52%", right: "28%", delay: "0.6s",  duration: "3.5s"},
  { label: "GDPR Ready",          top: "32%", right: "38%", delay: "1.8s",  duration: "4.8s"},
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
          <LiveBadge label="Secure Aggregation Active" />
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold text-ink-950 tracking-tight leading-[1.05] text-balance">
            Smarter care.{" "}
            <span className="text-medical-500">Zero data exposure.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-500 leading-relaxed max-w-2xl">
            HealthGuard AI enables hospitals to collaboratively train disease prediction models
            across networks. Patient data never leaves your firewall — secured by Federated Learning,
            Differential Privacy, and TLS-encrypted aggregation.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-all shadow-lg shadow-medical-500/25 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Free <ArrowRight className="w-4 h-4" />
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
    <div className="border-l-2 border-medical-200 pl-4">
      <div className="text-2xl font-bold text-ink-950 tracking-tight">{value}</div>
      <div className="text-xs text-ink-400 mt-1 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

const institutions = [
  "Mayo Clinic",
  "Johns Hopkins",
  "Berlin Charité",
  "Karolinska Institute",
  "Cleveland Clinic",
  "Tokyo Medical University",
  "Toronto General",
  "São Paulo Hospital das Clínicas",
  "Stanford Medical Center",
  "Oxford University Hospitals",
];

function TrustedBy() {
  // duplicate for seamless loop
  const items = [...institutions, ...institutions];
  return (
    <section className="py-12 border-y border-ink-100 bg-ink-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest">
          Trusted by leading medical institutions worldwide
        </p>
      </div>
      <div className="relative">
        {/* fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-ink-50/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-ink-50/80 to-transparent z-10 pointer-events-none" />
        {/* scrolling track */}
        <div
          className="flex gap-12 items-center"
          style={{
            animation: "scroll-x 30s linear infinite",
            width: "max-content",
          }}
        >
          {items.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white border border-ink-100 shadow-sm whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-md bg-medical-500/10 flex items-center justify-center shrink-0">
                <ShieldPlus className="w-3.5 h-3.5 text-medical-500" />
              </div>
              <span className="text-sm font-semibold text-ink-700">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Local Training", body: "Each hospital trains the shared model on private clinical records. Data never leaves the firewall." },
    { n: "02", title: "Differential Privacy", body: "Calibrated noise is injected into gradient updates, bounding individual patient re-identification risk." },
    { n: "03", title: "FedAvg Aggregation", body: "The coordinator averages encrypted weight updates from all nodes into a global consensus model." },
    { n: "04", title: "Global Dispatch", body: "The refined model is redistributed to every node, improving local diagnostic accuracy for the next round." },
  ];
  return (
    <section id="how-it-works" className="px-6 py-24 border-t border-ink-200">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-bold text-medical-600 uppercase tracking-widest mb-4 font-mono">The Protocol</div>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-950 tracking-tight text-balance">
            Collective intelligence without exposure.
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
    { icon: Lock, title: "Differential Privacy", body: "Mathematical proof that individual records cannot be reverse-engineered from global model weights." },
    { icon: ShieldPlus, title: "Secure Aggregation", body: "Cryptographic MPC ensures the coordinator only sees the sum of updates — never raw hospital gradients." },
    { icon: Network, title: "TLS Everywhere", body: "Mutual-TLS 1.3 secures every hop between hospital nodes and the aggregation server." },
    { icon: Brain, title: "Zero-Knowledge Hub", body: "The orchestrator remains blind to local data distributions while achieving maximum convergence." },
  ];
  return (
    <section id="security" className="px-6 py-24 bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <div className="text-xs font-bold text-medical-400 uppercase tracking-widest mb-4 font-mono">Privacy Stack</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Clinical-grade guarantees at every layer.
            </h2>
            <p className="mt-6 text-ink-300 max-w-md">
              We exceed HIPAA and GDPR mandates with a multi-layered cryptographic approach — verified through independent security audits.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["HIPAA", "GDPR", "SOC 2", "ISO 27001"].map((l) => (
                <span key={l} className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono font-semibold tracking-wider">{l}</span>
              ))}
            </div>
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
    { tag: "Diabetes", headline: "+38%", body: "Improvement in early-onset detection sensitivity vs. locally-trained baselines across 8 partner sites." },
    { tag: "Cardiac", headline: "0.94 AUC", body: "Federated CardioRisk-v4 outperforms every siloed model in cross-institutional validation." },
    { tag: "Privacy", headline: "ε = 0.045", body: "Formal differential privacy budget maintained across all 412 training rounds. Audit-verified." },
  ];
  return (
    <section id="stats" className="px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-bold text-medical-600 uppercase tracking-widest mb-4 font-mono">Research Outcomes</div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink-950 tracking-tight">Proven results across institutions.</h2>
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
          <LiveBadge label="Onboarding Q3 partners" />
          <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-balance max-w-2xl">
            Ready to join the federation?
          </h2>
          <p className="mt-4 text-ink-300 max-w-xl">
            Fourteen leading institutions already train superior diagnostic models on our infrastructure.
            Bring your data — leave it exactly where it is.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-medical-500 text-white font-semibold rounded-xl hover:bg-medical-600 transition-colors shadow-lg shadow-medical-500/30"
            >
              Request access <ChevronRight className="w-4 h-4" />
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
          {["Security", "Compliance", "Ethics", "Contact"].map((l) => (
            <a key={l} href="#" className="hover:text-ink-950 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
