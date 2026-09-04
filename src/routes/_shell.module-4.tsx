import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Car,
  Download,
  Edit3,
  FlaskConical,
  Fuel,
  Gauge,
  Plane,
  Route as RouteIcon,
  Timer,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/reveal";

export const Route = createFileRoute("/_shell/module-4")({
  head: () => ({
    meta: [
      { title: "Module 4 · Route Optimization and Performance Analysis" },
      {
        name: "description",
        content:
          "Compare original and optimized routes with distance, fuel and time savings plus algorithm efficiency charts.",
      },
      { property: "og:title", content: "Module 4 · Route Optimization and Performance Analysis" },
      {
        property: "og:description",
        content: "Savings metrics, efficiency charts, heatmap and downloadable analytics report.",
      },
    ],
  }),
  component: ModuleFour,
});

// ─── Scenario type & presets ──────────────────────────────────────────────────

type Scenario = {
  id: string;
  label: string;
  icon: React.ElementType;
  source: string;
  destination: string;
  origRoute: string[];
  optRoute: string[];
  origDist: number;
  optDist: number;
  origTime: number;
  optTime: number;
  origFuel: number;
  optFuel: number;
  origCost: number;
  optCost: number;
};

const scenarios: Scenario[] = [
  {
    id: "commute",
    label: "City Commute",
    icon: Car,
    source: "Home",
    destination: "Office",
    origRoute: ["A", "B", "C", "D", "H"],
    optRoute: ["A", "E", "F", "G", "H"],
    origDist: 18.4,
    optDist: 13.6,
    origTime: 34,
    optTime: 23,
    origFuel: 1.42,
    optFuel: 1.11,
    origCost: 27,
    optCost: 19,
  },
  {
    id: "delivery",
    label: "Cross-Town Delivery",
    icon: Truck,
    source: "Warehouse",
    destination: "Drop Zone",
    origRoute: ["W", "A", "B", "C", "D"],
    optRoute: ["W", "E", "F", "D"],
    origDist: 24.2,
    optDist: 17.8,
    origTime: 48,
    optTime: 31,
    origFuel: 1.98,
    optFuel: 1.46,
    origCost: 38,
    optCost: 26,
  },
  {
    id: "airport",
    label: "Airport Route",
    icon: Plane,
    source: "City Centre",
    destination: "Terminal",
    origRoute: ["C", "M", "N", "O", "T"],
    optRoute: ["C", "X", "T"],
    origDist: 32.1,
    optDist: 22.5,
    origTime: 55,
    optTime: 38,
    origFuel: 2.64,
    optFuel: 1.85,
    origCost: 51,
    optCost: 34,
  },
];

// ─── Compare & efficiency data builders ──────────────────────────────────────

function buildCompare(s: Scenario) {
  return [
    { metric: "Distance (km)", original: s.origDist, optimized: s.optDist },
    { metric: "Time (min)", original: s.origTime, optimized: s.optTime },
    { metric: "Fuel (L×10)", original: +(s.origFuel * 10).toFixed(1), optimized: +(s.optFuel * 10).toFixed(1) },
    { metric: "Graph cost", original: s.origCost, optimized: s.optCost },
  ];
}

const efficiency = Array.from({ length: 8 }, (_, i) => ({
  run: `Run ${i + 1}`,
  dijkstra: 88 + Math.round(Math.sin(i) * 5),
  floyd: 62 + Math.round(Math.cos(i) * 7),
}));

const share = [
  { name: "Path search", value: 54 },
  { name: "Relaxation", value: 26 },
  { name: "Reconstruction", value: 12 },
  { name: "Rendering", value: 8 },
];
const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

// ─── Ring Component ───────────────────────────────────────────────────────────

function Ring({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 90 90" className="h-20 w-20">
      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <motion.circle
        cx="45" cy="45" r={r}
        fill="none" stroke="var(--primary)" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c * (1 - pct / 100) }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 45 45)"
      />
      <text x="45" y="50" textAnchor="middle" fontSize="16"
        fill="var(--card-foreground)" fontFamily="var(--font-mono)">
        {value}
      </text>
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function ModuleFour() {
  const [activeId, setActiveId] = useState("commute");
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({
    source: "", destination: "",
    origRoute: "", optRoute: "",
    origDist: "", optDist: "",
    origTime: "", optTime: "",
    origFuel: "", optFuel: "",
  });
  const [appliedCustom, setAppliedCustom] = useState<Scenario | null>(null);

  const scenario = appliedCustom ?? (scenarios.find((s) => s.id === activeId) ?? scenarios[0]!);

  const distSaved = Math.round((1 - scenario.optDist / scenario.origDist) * 100);
  const timeSaved = Math.round((1 - scenario.optTime / scenario.origTime) * 100);
  const fuelSaved = Math.round((1 - scenario.optFuel / scenario.origFuel) * 100);
  const scoreVal = Math.round((distSaved + timeSaved + fuelSaved) / 3);

  const metrics = [
    { label: "Distance Saved", value: distSaved, unit: "%", icon: RouteIcon, detail: `${scenario.origDist} km → ${scenario.optDist} km` },
    { label: "Fuel Saved", value: fuelSaved, unit: "%", icon: Fuel, detail: `${scenario.origFuel} L → ${scenario.optFuel} L` },
    { label: "Time Saved", value: timeSaved, unit: "%", icon: Timer, detail: `${scenario.origTime} min → ${scenario.optTime} min` },
    { label: "Optimization Score", value: scoreVal, unit: "/100", icon: Gauge, detail: "Composite index" },
  ];

  const compare = buildCompare(scenario);

  const heat = scenario.optRoute.length > 0 ? scenario.optRoute : ["A", "B", "C", "D", "E", "F", "G", "H"];

  const tooltip = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--popover-foreground)",
  };

  const applyCustom = () => {
    const parseRoute = (s: string) => s.split(/[\s,→>-]+/).map((x) => x.trim()).filter(Boolean);
    const c: Scenario = {
      id: "custom",
      label: "Custom Route",
      icon: RouteIcon,
      source: custom.source || "A",
      destination: custom.destination || "B",
      origRoute: parseRoute(custom.origRoute) || ["A", "Z"],
      optRoute: parseRoute(custom.optRoute) || ["A", "Z"],
      origDist: parseFloat(custom.origDist) || 20,
      optDist: parseFloat(custom.optDist) || 14,
      origTime: parseFloat(custom.origTime) || 40,
      optTime: parseFloat(custom.optTime) || 28,
      origFuel: parseFloat(custom.origFuel) || 1.6,
      optFuel: parseFloat(custom.optFuel) || 1.1,
      origCost: Math.round((parseFloat(custom.origDist) || 20) * 1.5),
      optCost: Math.round((parseFloat(custom.optDist) || 14) * 1.5),
    };
    setAppliedCustom(c);
    setShowCustom(false);
    toast.success("Custom route applied");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Module 04"
        title="Route Optimization and Performance Analysis"
        description="Quantifies the benefit of the optimized corridor and benchmarks both algorithms across time, memory and traversal cost."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Module 4" },
        ]}
        actions={
          <button
            onClick={() => toast.success("Analytics report downloaded")}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Download className="h-4 w-4" /> Download report
          </button>
        }
      />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6">

        {/* ── Sample Scenario Selector ── */}
        <section>
          <SectionHeading eyebrow="Sample Test Inputs" title="Choose a routing scenario" />
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveId(s.id); setAppliedCustom(null); }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    activeId === s.id && !appliedCustom
                      ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustom((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  showCustom || appliedCustom
                    ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="h-4 w-4" /> Custom Input
              </button>
            </div>

            {/* Custom input form */}
            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-primary" /> Enter your route details
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-xs text-muted-foreground">
                        Source Location
                        <input value={custom.source} onChange={(e) => setCustom((c) => ({ ...c, source: e.target.value }))}
                          placeholder="e.g. Home" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Destination
                        <input value={custom.destination} onChange={(e) => setCustom((c) => ({ ...c, destination: e.target.value }))}
                          placeholder="e.g. Office" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Original Route (comma-separated nodes)
                        <input value={custom.origRoute} onChange={(e) => setCustom((c) => ({ ...c, origRoute: e.target.value }))}
                          placeholder="A, B, C, D, H" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Optimized Route (comma-separated nodes)
                        <input value={custom.optRoute} onChange={(e) => setCustom((c) => ({ ...c, optRoute: e.target.value }))}
                          placeholder="A, E, F, G, H" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Original Distance (km)
                        <input type="number" value={custom.origDist} onChange={(e) => setCustom((c) => ({ ...c, origDist: e.target.value }))}
                          placeholder="18.4" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Optimized Distance (km)
                        <input type="number" value={custom.optDist} onChange={(e) => setCustom((c) => ({ ...c, optDist: e.target.value }))}
                          placeholder="13.6" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Original Time (min)
                        <input type="number" value={custom.origTime} onChange={(e) => setCustom((c) => ({ ...c, origTime: e.target.value }))}
                          placeholder="34" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Optimized Time (min)
                        <input type="number" value={custom.optTime} onChange={(e) => setCustom((c) => ({ ...c, optTime: e.target.value }))}
                          placeholder="23" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Original Fuel (L)
                        <input type="number" step="0.01" value={custom.origFuel} onChange={(e) => setCustom((c) => ({ ...c, origFuel: e.target.value }))}
                          placeholder="1.42" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                      <label className="block text-xs text-muted-foreground">
                        Optimized Fuel (L)
                        <input type="number" step="0.01" value={custom.optFuel} onChange={(e) => setCustom((c) => ({ ...c, optFuel: e.target.value }))}
                          placeholder="1.11" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </label>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={applyCustom}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                        <FlaskConical className="h-4 w-4" /> Apply & Analyze
                      </button>
                      <button onClick={() => setShowCustom(false)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Route Comparison ── */}
        <section>
          <SectionHeading eyebrow="Route Comparison" title="Original versus optimized" />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {[
              { title: "Original Route", path: scenario.origRoute, cost: `${scenario.origDist} km · ${scenario.origTime} min`, tone: "var(--muted-foreground)" },
              { title: "Optimized Route", path: scenario.optRoute, cost: `${scenario.optDist} km · ${scenario.optTime} min`, tone: "var(--success)" },
            ].map((r, ri) => (
              <Reveal key={r.title} delay={ri * 0.1}>
                <div className="card-elevated rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">{r.title}</h3>
                    <span className="font-mono text-xs text-muted-foreground">{r.cost}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {r.path.map((p, i) => (
                      <motion.span
                        key={`${p}-${i}`}
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 }}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="grid h-10 w-10 place-items-center rounded-full border font-mono text-sm"
                          style={{ borderColor: r.tone, color: r.tone }}
                        >
                          {p}
                        </span>
                        {i < r.path.length - 1 && <span className="text-muted-foreground">→</span>}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Performance Metrics ── */}
        <section>
          <SectionHeading eyebrow="Performance Metrics" title="Savings after optimization" />

          {/* Central Score Spotlight */}
          <Reveal>
            <div className="mt-8 mb-6 flex justify-center">
              <motion.div
                key={scenario.id + scoreVal}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 22 }}
                className="relative flex flex-col items-center"
              >
                {[0, 0.6, 1.2].map((delay) => (
                  <motion.div
                    key={delay}
                    className="absolute rounded-full"
                    style={{ background: "var(--success)", width: 130, height: 130 }}
                    animate={{ scale: [1, 1.8], opacity: [0.18, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay }}
                  />
                ))}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border)" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r="48"
                      fill="none" stroke="var(--success)" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={2 * Math.PI * 48}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - scoreVal / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={scoreVal}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="font-mono text-3xl font-bold text-success"
                    >
                      {scoreVal}
                    </motion.span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</span>
                  </div>
                </div>
                <motion.p key={scenario.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm font-semibold">
                  {scenario.source} → {scenario.destination}
                </motion.p>
                <p className="text-xs text-muted-foreground">composite optimization index</p>
              </motion.div>
            </div>
          </Reveal>

          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <StaggerItem key={m.label}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="card-elevated flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 cursor-default"
                >
                  <div className="relative flex-shrink-0">
                    <Ring value={m.value} />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-success"
                      animate={{ scale: [1, 1.4], opacity: [0.15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <m.icon className="h-4 w-4 text-primary" />
                    <p className="mt-2 truncate text-sm font-semibold">{m.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.detail}</p>
                    <motion.p
                      key={m.value}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="mt-1 font-mono text-xs text-primary"
                    >
                      {m.value}{m.unit}
                    </motion.p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── Charts ── */}
        <section className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="card-elevated rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Route Comparison Chart</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compare}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="metric" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={tooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="original" name="Original" fill="var(--muted-foreground)" radius={[6, 6, 0, 0]} opacity={0.6} />
                    <Bar dataKey="optimized" name="Optimized" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card-elevated rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Algorithm Efficiency</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiency}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="run" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={tooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="dijkstra" name="Dijkstra score" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="floyd" name="Floyd score" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="card-elevated rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Compute Distribution</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={share} dataKey="value" nameKey="name" outerRadius={85} stroke="var(--card)">
                      {share.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card-elevated rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">All-Pairs Cost Heatmap</h3>
              <div className="mt-4 grid grid-cols-9 gap-1 text-[10px]">
                <span />
                {heat.map((h) => (
                  <span key={h} className="text-center font-mono text-muted-foreground">{h}</span>
                ))}
                {heat.map((row, i) => (
                  <div key={row} className="contents">
                    <span className="font-mono text-muted-foreground">{row}</span>
                    {heat.map((col, j) => {
                      const v = i === j ? 0 : ((i * 3 + j * 5) % 18) + 2;
                      return (
                        <motion.span
                          key={col}
                          title={`${row}→${col}: ${v}`}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          whileHover={{ scale: 1.2 }}
                          viewport={{ once: true }}
                          transition={{ delay: (i * 8 + j) * 0.006 }}
                          className="grid aspect-square place-items-center rounded font-mono cursor-default"
                          style={{
                            background: `color-mix(in oklab, var(--primary) ${v * 5}%, var(--surface))`,
                          }}
                        >
                          {v}
                        </motion.span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Side-by-side table ── */}
        <section>
          <SectionHeading eyebrow="Route Comparison Table" title="Side-by-side results" />
          <Reveal className="mt-8">
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-surface text-xs tracking-widest uppercase">
                  <tr>
                    {["Metric", "Original", "Optimized", "Delta"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Distance", `${scenario.origDist} km`, `${scenario.optDist} km`, `−${(scenario.origDist - scenario.optDist).toFixed(1)} km`],
                    ["Travel time", `${scenario.origTime} min`, `${scenario.optTime} min`, `−${scenario.origTime - scenario.optTime} min`],
                    ["Fuel", `${scenario.origFuel} L`, `${scenario.optFuel} L`, `−${(scenario.origFuel - scenario.optFuel).toFixed(2)} L`],
                    ["Hops", String(scenario.origRoute.length - 1), String(scenario.optRoute.length - 1), String(scenario.optRoute.length - scenario.origRoute.length)],
                    ["Total cost", String(scenario.origCost), String(scenario.optCost), `−${scenario.origCost - scenario.optCost}`],
                  ].map((row, i) => (
                    <motion.tr
                      key={row[0]}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="border-t border-border transition-colors hover:bg-secondary/50"
                    >
                      {row.map((cell, j) => (
                        <td key={j} className={`px-5 py-3 ${j === 3 ? "font-mono text-success" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}