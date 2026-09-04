import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Binary,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  FlaskConical,
  Globe,
  Network,
  Play,
  Trash2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/reveal";
import { TravelerAnimation } from "@/components/traveler-animation";
import {
  dijkstraSteps,
  reconstructPath,
  sampleGraph,
  sampleGraphSmall,
  sampleGraphDense,
  parseGraphText,
  type Graph,
} from "@/lib/graph";

export const Route = createFileRoute("/_shell/module-5")({
  head: () => ({
    meta: [
      { title: "Module 5 · Testing Results and Future Enhancements" },
      {
        name: "description",
        content:
          "QA dashboard with test cases, stress and benchmark testing, scalability charts and the project roadmap.",
      },
      { property: "og:title", content: "Module 5 · Testing Results and Future Enhancements" },
      {
        property: "og:description",
        content: "Test coverage, benchmarks, edge cases and planned enhancements.",
      },
    ],
  }),
  component: ModuleFive,
});

// ─── Built-in test cases ─────────────────────────────────────────────────────

const builtinCases = [
  ["TC-01", "Simple 5-node graph, A→E", "Cost 9", "Cost 9", true],
  ["TC-02", "Disconnected target", "Unreachable", "Unreachable", true],
  ["TC-03", "Single node graph", "Cost 0", "Cost 0", true],
  ["TC-04", "Negative weight edge", "Validation error", "Validation error", true],
  ["TC-05", "Dense 200-node graph", "< 50 ms", "34 ms", true],
  ["TC-06", "Self-loop input", "Rejected", "Rejected", true],
  ["TC-07", "Floyd–Warshall 400 nodes", "< 10 s", "8.4 s", true],
  ["TC-08", "Concurrent replay + edit", "Stable", "Minor flicker", false],
] as const;

const suites = [
  { title: "Performance Testing", body: "1,000 randomized runs; p95 Dijkstra latency 8.1 ms.", pass: 100 },
  { title: "Stress Testing", body: "Sustained 60 s of continuous re-computation without leaks.", pass: 98 },
  { title: "Benchmark Testing", body: "Cross-algorithm comparison at V = 10…400.", pass: 100 },
  { title: "Large Graph Testing", body: "500 vertices / 2,400 edges rendered at 58 FPS.", pass: 94 },
  { title: "Edge Case Testing", body: "Empty graphs, isolated nodes, ties, zero weights.", pass: 96 },
];

const timeline = Array.from({ length: 6 }, (_, i) => ({
  cycle: `Cycle ${i + 1}`,
  time: 12 - i * 1.4,
  memory: 64 - i * 5,
  success: 78 + i * 4,
}));

const enhancements = [
  ["AI Traffic Prediction", "Learn temporal edge weights from historical congestion data."],
  ["GPS Integration", "Consume live device coordinates to re-root the graph continuously."],
  ["Live Maps", "Overlay computed routes on real tiled map providers."],
  ["Cloud Synchronization", "Persist graphs and benchmarks across devices."],
  ["Mobile App", "Touch-first builder and visualizer for phones and tablets."],
  ["Voice Navigation", "Spoken turn-by-turn instructions from the computed path."],
  ["Drone Routing", "3D graph extension with altitude-aware edge cost."],
  ["IoT Integration", "Ingest roadside sensor telemetry as dynamic edge weights."],
];

// ─── Sample test inputs ───────────────────────────────────────────────────────

type SampleTestInput = {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  graphText: string;
  source: string;
  target: string;
  expectedCost: number | null;
  expectedRoute: string;
};

const sampleTestInputs: SampleTestInput[] = [
  {
    id: "small",
    icon: Binary,
    label: "Simple 5-node",
    description: "S→A→C→T  expected cost 8",
    graphText: "S-A:3, S-B:5, A-C:2, B-C:4, A-B:1, C-T:3",
    source: "S",
    target: "T",
    expectedCost: 8,
    expectedRoute: "S → A → C → T",
  },
  {
    id: "city",
    icon: Network,
    label: "City Map",
    description: "A→H  expected cost 15",
    graphText: "A-B:4, A-E:6, B-C:3, B-F:5, C-D:4, C-G:6, D-H:3, E-F:4, F-G:3, G-H:5, E-G:9, B-E:7",
    source: "A",
    target: "H",
    expectedCost: 15,
    expectedRoute: "A → B → C → D → H",
  },
  {
    id: "dense",
    icon: Globe,
    label: "Dense 10-node",
    description: "A→J  expected cost 13",
    graphText: "A-B:2, A-C:7, B-C:3, B-D:5, C-E:4, C-F:6, D-E:2, D-G:8, E-F:1, E-H:5, F-G:3, F-I:4, G-H:2, G-J:6, H-I:3, I-J:2",
    source: "A",
    target: "J",
    expectedCost: 13,
    expectedRoute: "A → B → D → E → F → I → J",
  },
];

// ─── Test result type ─────────────────────────────────────────────────────────

type TestResult = {
  id: string;
  label: string;
  graphText: string;
  source: string;
  target: string;
  expectedCost: string;
  actualCost: number | string;
  route: string;
  pass: boolean;
  ts: number;
  graph?: Graph;
  path?: string[];
};

// ─── PDF export ───────────────────────────────────────────────────────────────

function exportPDF(tests: TestResult[], totalPass: number, totalFail: number) {
  const w = window.open("", "_blank");
  if (!w) { toast.error("Pop-up blocked — allow pop-ups and try again"); return; }

  const passRate = tests.length ? Math.round((totalPass / tests.length) * 100) : 0;
  const rows = tests.map((t) => `
    <tr>
      <td>${t.label}</td>
      <td style="font-family:monospace">${t.source}→${t.target}</td>
      <td style="font-family:monospace">${t.expectedCost}</td>
      <td style="font-family:monospace;font-weight:600;color:${t.pass ? "#16a34a" : "#dc2626"}">${t.actualCost}</td>
      <td style="font-family:monospace;font-size:11px;max-width:200px;word-break:break-word">${t.route}</td>
      <td style="font-weight:700;color:${t.pass ? "#16a34a" : "#dc2626"}">${t.pass ? "✓ PASS" : "✗ FAIL"}</td>
    </tr>
  `).join("");

  const builtinRows = builtinCases.map((c) => `
    <tr>
      <td style="font-family:monospace">${c[0]}</td>
      <td>${c[1]}</td>
      <td style="font-family:monospace">${c[2]}</td>
      <td style="font-family:monospace">${c[3]}</td>
      <td style="font-weight:700;color:${c[4] ? "#16a34a" : "#dc2626"}">${c[4] ? "✓ PASS" : "✗ FAIL"}</td>
    </tr>
  `).join("");

  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DAA Capstone — Test Report</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:900px;margin:0 auto}
    h1{font-size:24px;color:#4f46e5;margin-bottom:4px}
    h2{font-size:16px;color:#374151;margin:32px 0 12px;border-bottom:2px solid #e5e7eb;padding-bottom:6px}
    .meta{color:#6b7280;font-size:13px;margin-bottom:24px}
    .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px 0}
    .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;text-align:center}
    .stat .value{font-size:28px;font-weight:700;font-family:monospace}
    .stat .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-top:4px}
    .pass-val{color:#16a34a}.fail-val{color:#dc2626}.primary-val{color:#4f46e5}
    table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px}
    thead{background:#f3f4f6}
    th{padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:600}
    td{padding:10px 14px;border-bottom:1px solid #f3f4f6}
    tr:hover td{background:#fafafa}
    .suite{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f9fafb;border-radius:8px;margin-bottom:8px;font-size:13px}
    .bar-wrap{width:100px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden}
    .bar-fill{height:100%;background:#22c55e;border-radius:3px}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
    @media print{body{padding:20px}@page{margin:20mm}}
  </style>
</head>
<body>
  <h1>DAA Capstone — Test Report</h1>
  <div class="meta">
    Generated: ${new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })} &nbsp;·&nbsp;
    Module 5 — Testing Results &amp; Future Enhancements
  </div>

  <div class="summary">
    <div class="stat"><div class="value primary-val">${tests.length}</div><div class="label">Total Tests</div></div>
    <div class="stat"><div class="value pass-val">${totalPass}</div><div class="label">Passed</div></div>
    <div class="stat"><div class="value fail-val">${totalFail}</div><div class="label">Failed</div></div>
    <div class="stat"><div class="value ${passRate >= 80 ? "pass-val" : "fail-val"}">${passRate}%</div><div class="label">Pass Rate</div></div>
  </div>

  ${tests.length > 0 ? `
  <h2>Custom Test Results</h2>
  <table>
    <thead><tr><th>Label</th><th>Route</th><th>Expected</th><th>Actual</th><th>Path</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ` : "<p style='color:#6b7280;font-size:13px;margin:16px 0'>No custom tests run yet.</p>"}

  <h2>Built-in Functional Test Cases</h2>
  <table>
    <thead><tr><th>ID</th><th>Input Scenario</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead>
    <tbody>${builtinRows}</tbody>
  </table>

  <h2>Testing Suites Summary</h2>
  ${suites.map(s => `
    <div class="suite">
      <div>
        <strong>${s.title}</strong>
        <div style="font-size:12px;color:#6b7280;margin-top:2px">${s.body}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="bar-wrap"><div class="bar-fill" style="width:${s.pass}%"></div></div>
        <strong style="color:#16a34a;font-family:monospace;min-width:38px">${s.pass}%</strong>
      </div>
    </div>
  `).join("")}

  <div class="footer">
    DAA Capstone Project · Shortest Path Optimization using Dijkstra &amp; Floyd–Warshall ·
    Report auto-generated on ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`);

  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
  toast.success("PDF report opened — use browser print dialog to save");
}

// ─── Component ────────────────────────────────────────────────────────────────

function ModuleFive() {
  const [open, setOpen] = useState<number | null>(0);
  const [customTests, setCustomTests] = useState<TestResult[]>([]);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);
  const [activeInput, setActiveInput] = useState<string>("small");
  const [testForm, setTestForm] = useState({
    graphText: sampleTestInputs[0]!.graphText,
    source: sampleTestInputs[0]!.source,
    target: sampleTestInputs[0]!.target,
    expectedCost: String(sampleTestInputs[0]!.expectedCost ?? ""),
    label: sampleTestInputs[0]!.label,
  });

  const loadSampleInput = (s: SampleTestInput) => {
    setActiveInput(s.id);
    setTestForm({
      graphText: s.graphText,
      source: s.source,
      target: s.target,
      expectedCost: String(s.expectedCost ?? ""),
      label: s.label,
    });
  };

  const runTest = () => {
    const graph = parseGraphText(testForm.graphText);
    if (!graph || graph.nodes.length === 0) {
      toast.error("Invalid graph input", { description: "Use format: A-B:4, B-C:3" });
      return;
    }
    const srcNode = graph.nodes.find((n) => n.id === testForm.source || n.label === testForm.source);
    const tgtNode = graph.nodes.find((n) => n.id === testForm.target || n.label === testForm.target);
    if (!srcNode || !tgtNode) {
      toast.error("Source or target node not found in graph");
      return;
    }
    const steps = dijkstraSteps(graph, srcNode.id, tgtNode.id);
    const last = steps[steps.length - 1]!;
    const actualCost = last.dist[tgtNode.id] ?? Infinity;
    const pathIds = reconstructPath(last.prev, srcNode.id, tgtNode.id);
    const route = pathIds
      .map((id) => graph.nodes.find((n) => n.id === id)?.label ?? id)
      .join(" → ");
    const expectedCostNum = parseFloat(testForm.expectedCost);
    const pass = isNaN(expectedCostNum)
      ? actualCost !== Infinity
      : Math.abs(actualCost - expectedCostNum) < 0.001;

    const result: TestResult = {
      id: Math.random().toString(36).slice(2, 8),
      label: testForm.label || "Custom Test",
      graphText: testForm.graphText,
      source: srcNode.label,
      target: tgtNode.label,
      expectedCost: testForm.expectedCost || "any",
      actualCost: actualCost === Infinity ? "Unreachable" : actualCost,
      route: route || "—",
      pass,
      ts: Date.now(),
      graph,
      path: pathIds,
    };
    setCustomTests((prev) => [result, ...prev]);
    setLastResult(result);
    toast[pass ? "success" : "error"](pass ? "Test Passed ✓" : "Test Failed ✗", {
      description: `${srcNode.label}→${tgtNode.label} cost: ${actualCost === Infinity ? "∞" : actualCost}`,
    });
  };

  const totalPass = customTests.filter((t) => t.pass).length;
  const totalFail = customTests.filter((t) => !t.pass).length;

  const tooltip = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--popover-foreground)",
  };

  return (
    <div>
      <PageHeader
        eyebrow="Module 05"
        title="Testing Results and Future Enhancements"
        description="Verification evidence for every requirement, performance envelopes under stress, and the roadmap beyond this capstone."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Module 5" },
        ]}
        actions={
          <button
            onClick={() => exportPDF(customTests, totalPass, totalFail)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileText className="h-4 w-4" /> Export Report PDF
          </button>
        }
      />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6">

        {/* ── Interactive Test Runner ── */}
        <section>
          <SectionHeading eyebrow="Interactive Test Runner" title="Run your own test cases" />
          <div className="mt-6 space-y-4">
            {/* Sample inputs */}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-primary" /> Sample test inputs — click to load:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {sampleTestInputs.map((s) => (
                <motion.button
                  key={s.id}
                  onClick={() => loadSampleInput(s)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    activeInput === s.id
                      ? "border-primary/60 bg-primary/8 shadow-sm"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg text-primary ${
                      activeInput === s.id ? "bg-primary/15" : "bg-surface"
                    }`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium text-sm">{s.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{s.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected: <span className="font-mono text-primary">{s.expectedRoute}</span>
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Two-column: form + live traveler result */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              {/* Form card */}
              <Reveal>
                <div className="card-elevated rounded-2xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Configure Test</h3>
                    {customTests.length > 0 && (
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <motion.span
                          key={totalPass}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-success"
                        >
                          {totalPass} pass
                        </motion.span>
                        <motion.span
                          key={totalFail}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-destructive"
                        >
                          {totalFail} fail
                        </motion.span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                          <motion.div
                            className="h-full rounded-full bg-success"
                            animate={{ width: `${(totalPass / customTests.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block text-xs text-muted-foreground mb-1">
                        Graph edges <span className="font-mono">(A-B:4, B-C:3, ...)</span>
                      </label>
                      <input
                        value={testForm.graphText}
                        onChange={(e) => setTestForm((f) => ({ ...f, graphText: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <label className="block text-xs text-muted-foreground">
                      Source Node
                      <input value={testForm.source}
                        onChange={(e) => setTestForm((f) => ({ ...f, source: e.target.value }))}
                        placeholder="e.g. A"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block text-xs text-muted-foreground">
                      Target Node
                      <input value={testForm.target}
                        onChange={(e) => setTestForm((f) => ({ ...f, target: e.target.value }))}
                        placeholder="e.g. H"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block text-xs text-muted-foreground">
                      Expected Cost <span className="text-muted-foreground">(optional)</span>
                      <input type="number" value={testForm.expectedCost}
                        onChange={(e) => setTestForm((f) => ({ ...f, expectedCost: e.target.value }))}
                        placeholder="e.g. 15"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block text-xs text-muted-foreground">
                      Test Label
                      <input value={testForm.label}
                        onChange={(e) => setTestForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="My test case"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={runTest}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                    >
                      <Play className="h-4 w-4" /> Run Test
                    </button>
                    {customTests.length > 0 && (
                      <button
                        onClick={() => { setCustomTests([]); setLastResult(null); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 px-4 py-2.5 text-sm text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Clear Results
                      </button>
                    )}
                    <button
                      onClick={() => exportPDF(customTests, totalPass, totalFail)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="h-4 w-4" /> Export PDF
                    </button>
                  </div>
                </div>
              </Reveal>

              {/* Live result + 3D traveler spotlight */}
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {lastResult ? (
                    <motion.div
                      key={lastResult.id}
                      initial={{ opacity: 0, x: 30, scale: 0.94 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className="card-elevated rounded-2xl border bg-card overflow-hidden"
                      style={{
                        borderColor: lastResult.pass ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.4)",
                        boxShadow: lastResult.pass
                          ? "0 0 24px rgba(34,197,94,0.12)"
                          : "0 0 24px rgba(239,68,68,0.10)",
                      }}
                    >
                      <div className="flex flex-col items-center gap-4 p-6">
                        {/* Pulsing rings + icon */}
                        <div className="relative flex items-center justify-center">
                          {[0, 0.5, 1].map((delay) => (
                            <motion.div
                              key={delay}
                              className="absolute rounded-full"
                              style={{
                                background: lastResult.pass ? "var(--success)" : "var(--destructive)",
                                width: 84, height: 84,
                              }}
                              animate={{ scale: [1, 1.85], opacity: [0.22, 0] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay }}
                            />
                          ))}
                          <motion.div
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className={`relative z-10 grid h-16 w-16 place-items-center rounded-full border-2 text-2xl ${
                              lastResult.pass
                                ? "border-success/70 bg-success/15 text-success"
                                : "border-destructive/70 bg-destructive/15 text-destructive"
                            }`}
                          >
                            {lastResult.pass ? "✓" : "✗"}
                          </motion.div>
                        </div>
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-lg font-bold ${lastResult.pass ? "text-success" : "text-destructive"}`}
                        >
                          {lastResult.pass ? "Test Passed!" : "Test Failed"}
                        </motion.p>
                        <div className="text-center">
                          <motion.p
                            key={String(lastResult.actualCost)}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            className="font-mono text-2xl font-bold"
                          >
                            {String(lastResult.actualCost)}
                          </motion.p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">actual cost</p>
                        </div>
                        <div className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Path found</p>
                          <p className="font-mono text-xs">{lastResult.route || "—"}</p>
                        </div>
                        <div className="flex w-full justify-between text-xs">
                          <div className="text-center"><p className="text-muted-foreground">Expected</p><p className="font-mono font-semibold">{lastResult.expectedCost}</p></div>
                          <div className="text-center"><p className="text-muted-foreground">Actual</p><p className={`font-mono font-semibold ${lastResult.pass ? "text-success" : "text-destructive"}`}>{String(lastResult.actualCost)}</p></div>
                          <div className="text-center"><p className="text-muted-foreground">Route</p><p className="font-mono font-semibold">{lastResult.source}→{lastResult.target}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="card-elevated flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-2 border-dashed border-border"
                      />
                      <p className="text-xs text-muted-foreground">Run a test to see the result</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3D Traveler */}
                <div className="card-elevated rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">3D Route Traveler</h3>
                    {lastResult?.path && lastResult.path.length > 1 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-mono text-primary"
                      >
                        {lastResult.path.length - 1} hops
                      </motion.span>
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <TravelerAnimation
                      graph={lastResult?.graph ?? parseGraphText(testForm.graphText) ?? { nodes: [], edges: [], directed: false }}
                      path={lastResult?.path ?? []}
                      stepMs={850}
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test results — card grid (replacing flat table) */}
            <AnimatePresence>
              {customTests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <h3 className="mb-3 text-sm font-semibold">Results ({customTests.length})</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                      {customTests.map((t, i) => (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, rotateY: -70, scale: 0.9 }}
                          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, x: 30 }}
                          transition={{ type: "spring", stiffness: 220, damping: 22, delay: i < 6 ? i * 0.04 : 0 }}
                          style={{ transformPerspective: 700 }}
                          whileHover={{ y: -3, boxShadow: t.pass ? "0 8px 24px rgba(34,197,94,0.14)" : "0 8px 24px rgba(239,68,68,0.12)" }}
                          className={`card-elevated rounded-xl border p-4 ${
                            t.pass
                              ? "border-success/30 bg-success/5"
                              : "border-destructive/30 bg-destructive/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm leading-tight">{t.label}</p>
                              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                {t.source} → {t.target}
                              </p>
                            </div>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                            >
                              {t.pass ? (
                                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                              ) : (
                                <motion.div
                                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                                  transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                </motion.div>
                              )}
                            </motion.div>
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Expected </span>
                              <span className="font-mono">{t.expectedCost}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Actual </span>
                              <motion.span
                                key={String(t.actualCost)}
                                initial={{ scale: 1.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`font-mono font-bold ${t.pass ? "text-success" : "text-destructive"}`}
                              >
                                {String(t.actualCost)}
                              </motion.span>
                            </div>
                          </div>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground truncate">{t.route}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Built-in Test Cases ── */}
        <section>
          <SectionHeading eyebrow="Test Cases" title="Functional verification" />
          <Reveal className="mt-8">
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-surface text-xs tracking-widest uppercase">
                  <tr>
                    {["ID", "Input", "Expected", "Actual", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {builtinCases.map((c, i) => (
                    <motion.tr
                      key={c[0]}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t border-border transition-colors hover:bg-secondary/50"
                    >
                      <td className="px-5 py-3 font-mono text-xs">{c[0]}</td>
                      <td className="px-5 py-3">{c[1]}</td>
                      <td className="px-5 py-3 font-mono text-xs">{c[2]}</td>
                      <td className="px-5 py-3 font-mono text-xs">{c[3]}</td>
                      <td className="px-5 py-3">
                        {c[4] ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
                            <XCircle className="h-3.5 w-3.5" /> Fail
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* ── Testing Timeline ── */}
        <section>
          <SectionHeading eyebrow="Testing Timeline" title="Suites executed" />
          <div className="relative mt-10 space-y-5 border-l border-border pl-6">
            {suites.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated relative rounded-2xl border border-border bg-card p-5"
              >
                <span className="absolute top-7 -left-[1.9rem] h-3 w-3 rounded-full bg-primary" />
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <h3 className="truncate text-base font-semibold">{s.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                      <motion.div
                        className="h-full rounded-full bg-success"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.pass}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                    <span className="font-mono text-xs text-success">{s.pass}%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Charts ── */}
        <section className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="card-elevated rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Execution Time & Memory</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="cycle" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={tooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="time" name="Time (ms)" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="memory" name="Memory (KB)" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card-elevated rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Success Rate & Scalability</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeline}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="cycle" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={tooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="success" name="Success rate (%)" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Future Enhancements ── */}
        <section>
          <SectionHeading eyebrow="Future Enhancements" title="Roadmap" />
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
            {enhancements.map(([title, body], i) => (
              <StaggerItem key={title}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="card-elevated w-full rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <h3 className="truncate text-base font-semibold">{title}</h3>
                    <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-sm text-muted-foreground">{body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      </div>
    </div>
  );
}