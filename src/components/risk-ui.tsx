import { AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { RiskLevel, Trend } from "@/lib/risk";

export const RISK_STYLE: Record<RiskLevel, { label: string; icon: React.ElementType; text: string; chip: string; bar: string }> = {
  low: { label: "Low risk", icon: CheckCircle, text: "text-safety-600", chip: "bg-safety-500/10 border-safety-500/30 text-safety-600", bar: "bg-safety-500" },
  moderate: { label: "Moderate risk", icon: Info, text: "text-amber-600", chip: "bg-amber-50 border-amber-200 text-amber-700", bar: "bg-amber-400" },
  high: { label: "High risk", icon: AlertTriangle, text: "text-red-600", chip: "bg-red-50 border-red-200 text-red-600", bar: "bg-red-500" },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK_STYLE[level] ?? RISK_STYLE.low;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${s.chip}`}>
      <Icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
}

const TREND_STYLE: Record<Trend, { label: string; icon: React.ElementType; chip: string }> = {
  improving: { label: "Improving", icon: TrendingDown, chip: "bg-safety-500/10 border-safety-500/30 text-safety-600" },
  stable: { label: "Stable", icon: Minus, chip: "bg-ink-100 border-ink-200 text-ink-600" },
  deteriorating: { label: "Deteriorating", icon: TrendingUp, chip: "bg-red-50 border-red-200 text-red-600" },
};

export function TrendBadge({ trend, delta }: { trend: Trend; delta: number }) {
  const s = TREND_STYLE[trend];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${s.chip}`}>
      <Icon className="w-3.5 h-3.5" /> {s.label} ({delta > 0 ? "+" : ""}{delta})
    </span>
  );
}
