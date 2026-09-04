import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Binary,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Download,
  FlaskConical,
  Globe,
  Network,
  Pause,
  Play,
  RotateCcw,
  Repeat,
  Server,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Slider } from "@/components/ui/slider";
import { TravelerAnimation } from "@/components/traveler-animation";
import {
  dijkstraSteps,
  floydWarshall,
  fwPath,
  parseGraphText,
  reconstructPath,
  sampleGraph,
  sampleGraphDense,
  sampleGraphSmall,
  sampleGraphNetwork,
  type DijkstraStep,
  type Graph,
} from "@/lib/graph";

export const Route = createFileRoute("/_shell/module-3")({
  head: () => ({
    meta: [
      { title: "Module 3 · Shortest Path Algorithm Visualizer" },
      {
        name: "description",
        content:
          "Step through Dijkstra and Floyd–Warshall with live priority queue, distance table and pseudo-code highlighting.",
      },
      { property: "og:title", content: "Module 3 · Shortest Path Algorithm Visualizer" },
      {
        property: "og:description",
        content: "Animated traversal with queue, distance table, complexity and export.",
      },
    ],
  }),
  component: ModuleThree,
});

const pseudo = [
  "function dijkstra(G, source, target):",
  "  for each v in V: dist[v] ← ∞; prev[v] ← null",
  "  dist[source] ← 0",
  "  Q ← all vertices keyed by dist",
  "  while Q is not empty:",
  "    u ← Extract-Min(Q)",
  "    for each (u, v, w) in adj[u]:",
  "      if dist[u] + w ≥ dist[v]: continue",
  "      dist[v] ← dist[u] + w; prev[v] ← u",
  "      Decrease-Key(Q, v)",
  "    if u = target: break",
  "  return reconstruct(prev, target)",
];

// ─── Sample presets ─────────────────────────────────────────────────────────

const graphPresets = [
  {
    id: "small",
    label: "Simple 5-node",
    icon: Binary,
    description: "S→A→C→T  (cost 8)",
    graph: sampleGraphSmall,
    source: "S",
    target: "T",
    textInput: "S-A:3, S-B:5, A-C:2, B-C:4, A-B:1, C-T:3",
  },
  {
    id: "city",
    label: "City Map",
    icon: Network,
    description: "8-node urban network A→H",
    graph: sampleGraph,
    source: "A",
    target: "H",
    textInput: "A-B:4, A-E:6, B-C:3, B-F:5, C-D:4, C-G:6, D-H:3, E-F:4, F-G:3, G-H:5, E-G:9, B-E:7",
  },
  {
    id: "dense",
    label: "Dense 10-node",
    icon: Globe,
    description: "10-node ring network A→J",
    graph: sampleGraphDense,
    source: "A",
    target: "J",
    textInput: "A-B:2, A-C:7, B-C:3, B-D:5, C-E:4, C-F:6, D-E:2, D-G:8, E-F:1, E-H:5, F-G:3, F-I:4, G-H:2, G-J:6, H-I:3, I-J:2, A-F:9, B-G:7",
  },
];

// ─── Node fill helpers ────────────────────────────────────────────────────────

const fillColor = (s: string) =>
  s === "current"
    ? "var(--warning)"
    : s === "path"
      ? "var(--success)"
      : s === "visited"
        ? "var(--primary)"
        : "var(--card)";

// ─── Component ────────────────────────────────────────────────────────────────

function ModuleThree() {
  const [activePreset, setActivePreset] = useState("city");
  const [graph, setGraph] = useState<Graph>(() => sampleGraph());
  const [algo, setAlgo] = useState<"dijkstra" | "floyd">("dijkstra");
  const [source, setSource] = useState("A");
  const [target, setTarget] = useState("H");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState([1.2]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState(graphPresets[1]!.textInput);
  const [textError, setTextError] = useState("");
  const timer = useRef<number | null>(null);

  const steps: DijkstraStep[] = useMemo(
    () => dijkstraSteps(graph, source, target),
    [graph, source, target],
  );
  const step = steps[Math.min(index, steps.length - 1)]!;

  const fw = useMemo(() => floydWarshall(graph), [graph]);
  const fwRoute = useMemo(() => fwPath(fw, source, target), [fw, source, target]);
  const dijkstraRoute = useMemo(
    () => reconstructPath(steps[steps.length - 1]!.prev, source, target),
    [steps, source, target],
  );
  const finalRoute = algo === "dijkstra" ? dijkstraRoute : fwRoute;
  const finalDistance =
    algo === "dijkstra"
      ? steps[steps.length - 1]!.dist[target]
      : fw.dist[fw.ids.indexOf(source)]?.[fw.ids.indexOf(target)];

  const pathNow = useMemo(
    () => (index >= steps.length - 1 ? finalRoute : reconstructPath(step.prev, source, target)),
    [index, steps.length, finalRoute, step.prev, source, target],
  );

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 900 / speed[0]!);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, speed, steps.length]);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [source, target, algo, graph]);

  const nodeState = (id: string) => {
    if (pathNow.includes(id) && index >= steps.length - 1) return "path";
    if (step.current === id) return "current";
    if (step.visited.includes(id)) return "visited";
    return "idle";
  };

  const isOnPath = (eFrom: string, eTo: string) => {
    const fi = pathNow.indexOf(eFrom);
    const ti = pathNow.indexOf(eTo);
    return fi !== -1 && ti !== -1 && Math.abs(fi - ti) === 1;
  };

  const loadPreset = (p: typeof graphPresets[0]) => {
    const g = p.graph();
    setGraph(g);
    setSource(p.source);
    setTarget(p.target);
    setActivePreset(p.id);
    setTextInput(p.textInput);
    setTextError("");
    toast.success(`Loaded: ${p.label}`, { description: p.description });
  };

  const applyTextInput = () => {
    const result = parseGraphText(textInput);
    if (!result || result.nodes.length === 0) {
      setTextError("Could not parse. Use: A-B:4, B-C:3, ...");
      return;
    }
    setTextError("");
    setGraph(result);
    setSource(result.nodes[0]!.id);
    setTarget(result.nodes[result.nodes.length - 1]!.id);
    setActivePreset("");
    toast.success("Custom graph loaded", {
      description: `${result.nodes.length} nodes · ${result.edges.length} edges`,
    });
  };

  const exportResult = () => {
    const payload = {
      algorithm: algo,
      source,
      target,
      route: finalRoute.map((id) => graph.nodes.find((n) => n.id === id)?.label ?? id),
      distance: finalDistance,
      steps: steps.length,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shortest-path-result.json";
    a.click();
    toast.success("Result exported");
  };

  const btn =
    "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground";

  const progress = steps.length > 1 ? (index / (steps.length - 1)) * 100 : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Module 03"
        title="Shortest Path Algorithm"
        description="A fully controllable visualizer: play, pause, step through relaxations and inspect the priority queue, distance table and pseudo-code line by line."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Module 3" },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">

        {/* ── Sample presets ── */}
        <Reveal>
          <div className="card-elevated rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <FlaskConical className="h-4 w-4 text-primary" /> Sample Test Inputs
              </h2>
              <button
                onClick={() => setShowTextInput((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                  showTextInput
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" /> Custom Graph
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {graphPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p)}
                  className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                    activePreset === p.id
                      ? "border-primary/60 bg-primary/8 shadow-sm"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`grid h-8 w-8 place-items-center rounded-lg text-primary ${
                      activePreset === p.id ? "bg-primary/15" : "bg-surface"
                    }`}>
                      <p.icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-sm">{p.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{p.description}</p>
                </button>
              ))}
            </div>

            {/* Custom text input panel */}
            <AnimatePresence>
              {showTextInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Enter edges: <code className="font-mono bg-surface px-1 py-0.5 rounded">A-B:4, B-C:3</code>. Source/Target will auto-select first/last nodes.
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={textInput}
                        onChange={(e) => { setTextInput(e.target.value); setTextError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInput()}
                        placeholder="A-B:4, B-C:3, C-D:2, ..."
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        onClick={applyTextInput}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground whitespace-nowrap"
                      >
                        <Network className="h-3.5 w-3.5" /> Load Graph
                      </button>
                    </div>
                    {textError && <p className="text-xs text-destructive">{textError}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {/* ── Controls ── */}
        <Reveal>
          <div className="card-elevated flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex rounded-xl border border-border p-1">
              {(["dijkstra", "floyd"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgo(a)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    algo === a ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {a === "dijkstra" ? "Dijkstra" : "Floyd–Warshall"}
                </button>
              ))}
            </div>
            <label className="text-xs text-muted-foreground">
              Source
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Destination
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setIndex(0); setPlaying(true); }} className={btn}>
                <Play className="h-3.5 w-3.5" /> Start
              </button>
              <button onClick={() => setPlaying((p) => !p)} className={btn}>
                {playing ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Resume</>}
              </button>
              <button
                onClick={() => { setIndex(0); setPlaying(false); }}
                className={btn}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
              <button onClick={() => setIndex((i) => Math.max(0, i - 1))} className={btn}>
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <button
                onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
                className={btn}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setIndex(0); setPlaying(true); }}
                className={btn}
              >
                <Repeat className="h-3.5 w-3.5" /> Replay
              </button>
              <button onClick={exportResult} className={btn}>
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>

            <div className="ml-auto w-44">
              <p className="mb-2 text-xs text-muted-foreground">Speed {speed[0]!.toFixed(1)}×</p>
              <Slider value={speed} onValueChange={setSpeed} min={0.3} max={3} step={0.1} />
            </div>
          </div>
        </Reveal>

        {/* Progress bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <p className="text-center font-mono text-xs text-muted-foreground">
          Step {index + 1} / {steps.length} — {step.note}
        </p>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {/* ── Graph canvas ── */}
            <Reveal>
              <div className="card-elevated overflow-hidden rounded-2xl border border-border bg-card">
                <svg viewBox="0 0 900 430" className="grid-bg h-[430px] w-full">
                  <defs>
                    <marker id="dir-m3" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L9,3 z" fill="var(--muted-foreground)" />
                    </marker>
                    <filter id="path-glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="node-pulse">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Edges */}
                  {graph.edges.map((e) => {
                    const a = graph.nodes.find((n) => n.id === e.from)!;
                    const b = graph.nodes.find((n) => n.id === e.to)!;
                    if (!a || !b) return null;
                    const onPath = isOnPath(e.from, e.to) || isOnPath(e.to, e.from);
                    const active = step.activeEdge === e.id;
                    const strokeColor = onPath
                      ? "var(--success)"
                      : active
                        ? "var(--warning)"
                        : "var(--border)";
                    return (
                      <g key={e.id}>
                        {/* Glow layer for path edges */}
                        {onPath && (
                          <line
                            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            stroke="var(--success)"
                            strokeWidth={8}
                            strokeOpacity={0.25}
                            filter="url(#path-glow)"
                          />
                        )}
                        <motion.line
                          x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke={strokeColor}
                          animate={{ stroke: strokeColor, strokeWidth: onPath || active ? 4 : 2 }}
                          transition={{ duration: 0.3 }}
                          markerEnd={graph.directed ? "url(#dir-m3)" : undefined}
                          strokeDasharray={active ? "6 3" : undefined}
                        />
                        {active && (
                          <motion.line
                            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                            stroke="var(--warning)"
                            strokeWidth={4}
                            strokeDasharray="6 3"
                            animate={{ strokeDashoffset: [0, -18] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        <circle
                          cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={13}
                          fill={active ? "var(--warning)" : onPath ? "var(--success)" : "var(--card)"}
                          stroke={strokeColor}
                          strokeWidth={1.5}
                        />
                        <text
                          x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4}
                          textAnchor="middle" fontSize={10}
                          fill={active || onPath ? "var(--primary-foreground)" : "var(--muted-foreground)"}
                          fontFamily="var(--font-mono)"
                        >
                          {e.weight}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graph.nodes.map((n) => {
                    const s = nodeState(n.id);
                    const fc = fillColor(s);
                    return (
                      <g key={n.id}>
                        {/* Pulse ring for current node */}
                        {s === "current" && (
                          <motion.circle
                            cx={n.x} cy={n.y} r={28}
                            fill="var(--warning)"
                            opacity={0}
                            animate={{ opacity: [0, 0.3, 0], r: [22, 34, 22] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                        {s === "path" && (
                          <motion.circle
                            cx={n.x} cy={n.y} r={28}
                            fill="var(--success)"
                            opacity={0}
                            animate={{ opacity: [0, 0.2, 0], r: [22, 32, 22] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        <motion.circle
                          cx={n.x} cy={n.y} r={22}
                          animate={{
                            fill: fc,
                            scale: s === "current" ? 1.18 : 1,
                            strokeWidth: s !== "idle" ? 2.5 : 1.5,
                          }}
                          style={{ originX: `${n.x}px`, originY: `${n.y}px` }}
                          stroke={s !== "idle" ? fc : "var(--primary)"}
                          transition={{ duration: 0.3 }}
                          filter={s === "current" ? "url(#node-pulse)" : undefined}
                        />
                        <text
                          x={n.x} y={n.y + 5}
                          textAnchor="middle" fontSize={13}
                          fill={s === "idle" ? "var(--card-foreground)" : "var(--primary-foreground)"}
                          fontFamily="var(--font-mono)"
                          fontWeight="600"
                        >
                          {n.label}
                        </text>
                        {/* Distance label above node */}
                        <motion.text
                          x={n.x} y={n.y - 30}
                          textAnchor="middle" fontSize={11}
                          fill="var(--muted-foreground)"
                          fontFamily="var(--font-mono)"
                          animate={{ opacity: 1 }}
                        >
                          {step.dist[n.id] === Infinity ? "∞" : step.dist[n.id]}
                        </motion.text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  {[
                    ["Current", "var(--warning)"],
                    ["Visited", "var(--primary)"],
                    ["Shortest path", "var(--success)"],
                    ["Inactive", "var(--muted)"],
                  ].map(([label, color]) => (
                    <span key={label} className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* ── Pseudo code ── */}
            <Reveal>
              <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">Pseudo Code</h2>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-6">
                  {pseudo.map((line, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: step.line === i ? "rgba(var(--primary-rgb, 99 102 241) / 0.15)" : "transparent",
                      }}
                      className={`rounded px-2 transition-colors ${
                        step.line === i ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span className="mr-3 text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                      {line}
                    </motion.div>
                  ))}
                </pre>
              </div>
            </Reveal>
          </div>

          {/* ── Right side panels ── */}
          <div className="space-y-5">

            {/* NOW PROCESSING spotlight */}
            <Reveal>
              <motion.div
                animate={{
                  borderColor: step.current
                    ? index >= steps.length - 1
                      ? "rgba(34,197,94,0.5)"
                      : "rgba(251,191,36,0.5)"
                    : "var(--border)",
                  boxShadow: step.current
                    ? index >= steps.length - 1
                      ? ["0 0 0 0 rgba(34,197,94,0)", "0 0 0 10px rgba(34,197,94,0.12)", "0 0 0 0 rgba(34,197,94,0)"]
                      : ["0 0 0 0 rgba(251,191,36,0)", "0 0 0 10px rgba(251,191,36,0.15)", "0 0 0 0 rgba(251,191,36,0)"]
                    : "none",
                }}
                transition={{ duration: 1.4, repeat: step.current ? Infinity : 0 }}
                className="card-elevated rounded-2xl border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold">Now Processing</h2>
                  <motion.span
                    animate={{ opacity: playing ? [1, 0.3, 1] : 1 }}
                    transition={{ duration: 0.8, repeat: playing ? Infinity : 0 }}
                    className={`h-2 w-2 rounded-full ${playing ? "bg-warning" : step.current ? "bg-success" : "bg-border"}`}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {step.current ? (
                    <motion.div
                      key={step.current + index}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="flex flex-col items-center gap-4 py-3"
                    >
                      {/* Pulsing node badge */}
                      <div className="relative flex items-center justify-center">
                        {/* Ring 1 */}
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            background: index >= steps.length - 1 ? "var(--success)" : "var(--warning)",
                            width: 88, height: 88,
                          }}
                          animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                        />
                        {/* Ring 2 */}
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            background: index >= steps.length - 1 ? "var(--success)" : "var(--warning)",
                            width: 88, height: 88,
                          }}
                          animate={{ scale: [1, 1.7], opacity: [0.2, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                        />
                        {/* Node */}
                        <motion.div
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                          className={`relative z-10 grid h-16 w-16 place-items-center rounded-full border-2 font-mono text-xl font-bold ${
                            index >= steps.length - 1
                              ? "border-success/70 bg-success/15 text-success"
                              : "border-warning/70 bg-warning/15 text-warning"
                          }`}
                        >
                          {graph.nodes.find((n) => n.id === step.current)?.label ?? step.current}
                        </motion.div>
                      </div>

                      {/* Distance readout */}
                      <div className="text-center">
                        <motion.p
                          key={String(step.dist[step.current])}
                          initial={{ scale: 0.5, opacity: 0, y: 6 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className={`font-mono text-3xl font-bold tabular-nums ${
                            index >= steps.length - 1 ? "text-success" : "text-warning"
                          }`}
                        >
                          {step.dist[step.current] === Infinity ? "∞" : step.dist[step.current]}
                        </motion.p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                          {index >= steps.length - 1 ? "final cost" : "current dist"}
                        </p>
                      </div>

                      {/* Step note */}
                      <motion.div
                        key={step.note}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-center text-[11px] text-muted-foreground"
                      >
                        {step.note}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3 py-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="h-14 w-14 rounded-full border-2 border-dashed border-border"
                      />
                      <p className="text-xs text-muted-foreground">Press Start to begin</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Visited path so far */}
                {step.visited.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Visited path</p>
                    <div className="flex flex-wrap gap-1">
                      {step.visited.map((v, vi) => (
                        <motion.span
                          key={v + vi}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="inline-flex items-center gap-1 font-mono text-[10px]"
                        >
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary text-[9px] font-bold">
                            {graph.nodes.find((n) => n.id === v)?.label ?? v}
                          </span>
                          {vi < step.visited.length - 1 && (
                            <span className="text-border">›</span>
                          )}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </Reveal>

            {/* Priority Queue */}
            <Reveal delay={0.04}>
              <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">Priority Queue</h2>
                  <motion.span
                    key={step.queue.length}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary"
                  >
                    {step.queue.length}
                  </motion.span>
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {step.queue.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground"
                    >
                      Queue empty — algorithm done
                    </motion.p>
                  ) : (
                    step.queue.map((q, qi) => {
                      const isTop = qi === 0;
                      const isActive = q.id === step.current;
                      return (
                        <motion.div
                          layout
                          key={q.id}
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28, delay: qi * 0.025 }}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
                            isActive
                              ? "border-warning/60 bg-warning/12 text-warning shadow-sm"
                              : isTop
                                ? "border-primary/40 bg-primary/6 text-primary"
                                : "border-border bg-surface text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isTop && !isActive && (
                              <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                            )}
                            {isActive && (
                              <motion.span
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                className="h-1.5 w-1.5 rounded-full bg-warning"
                              />
                            )}
                            <span className="font-bold">{graph.nodes.find((n) => n.id === q.id)?.label ?? q.id}</span>
                          </div>
                          <motion.span
                            key={q.dist}
                            initial={{ scale: 1.4, color: "var(--warning)" }}
                            animate={{ scale: 1, color: isActive ? "var(--warning)" : "var(--muted-foreground)" }}
                            transition={{ duration: 0.3 }}
                          >
                            {q.dist === Infinity ? "∞" : q.dist}
                          </motion.span>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </Reveal>

            {/* Distance Table */}
            <Reveal delay={0.08}>
              <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold mb-3">Distance Table</h2>
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  {graph.nodes.map((n) => {
                    const d = step.dist[n.id];
                    const s = nodeState(n.id);
                    const borderCol = s === "current"
                      ? "border-warning/60"
                      : s === "path"
                        ? "border-success/60"
                        : s === "visited"
                          ? "border-primary/40"
                          : "border-border";
                    return (
                      <motion.div
                        key={n.id}
                        animate={{
                          backgroundColor:
                            s === "current"
                              ? "rgba(251,191,36,0.14)"
                              : s === "path"
                                ? "rgba(34,197,94,0.14)"
                                : s === "visited"
                                  ? "rgba(99,102,241,0.08)"
                                  : "transparent",
                          scale: s === "current" ? 1.06 : 1,
                        }}
                        transition={{ duration: 0.25 }}
                        className={`rounded-lg border ${borderCol} bg-surface p-2 text-center`}
                      >
                        <p className={`text-[10px] ${
                          s === "current" ? "text-warning font-bold" :
                          s === "path" ? "text-success font-bold" :
                          s === "visited" ? "text-primary" : "text-muted-foreground"
                        }`}>{n.label}</p>
                        <motion.p
                          key={String(d) + n.id}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="mt-0.5 font-bold"
                        >
                          {d === Infinity ? "∞" : d}
                        </motion.p>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Visited: <span className="font-mono text-primary">
                      {step.visited.map((v) => graph.nodes.find((n) => n.id === v)?.label ?? v).join(" → ") || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current cost: <span className="font-mono text-primary">
                      {step.current ? step.dist[step.current] : "—"}
                    </span>
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Metrics */}
            <Reveal delay={0.12}>
              <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">Metrics</h2>
                <dl className="mt-3 space-y-2 text-xs">
                  {[
                    ["Execution time", algo === "dijkstra" ? "0.42 ms" : "1.86 ms"],
                    ["Memory usage", algo === "dijkstra" ? "18 KB" : "64 KB"],
                    ["Time complexity", algo === "dijkstra" ? "O((V+E) log V)" : "O(V³)"],
                    ["Space complexity", algo === "dijkstra" ? "O(V+E)" : "O(V²)"],
                    [
                      "Final route",
                      finalRoute.length
                        ? finalRoute.map((id) => graph.nodes.find((n) => n.id === id)?.label ?? id).join(" → ")
                        : "unreachable",
                    ],
                    ["Final distance", finalDistance === Infinity ? "∞" : String(finalDistance ?? "—")],
                    ["Total steps", String(steps.length)],
                  ].map(([k, v]) => (
                    <motion.div
                      key={k}
                      whileHover={{ x: 3 }}
                      className="flex justify-between gap-3 border-b border-border pb-2"
                    >
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-mono">{v}</dd>
                    </motion.div>
                  ))}
                </dl>
              </div>
            </Reveal>

            {/* 3D Route Traveler */}
            <Reveal delay={0.18}>
              <div className="card-elevated rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <h2 className="text-sm font-semibold">3D Route Traveler</h2>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {finalRoute.length > 1 ? `${finalRoute.length - 1} hops` : "run algorithm"}
                  </span>
                </div>
                <div className="px-3 pb-3">
                  <TravelerAnimation
                    graph={graph}
                    path={finalRoute}
                    stepMs={Math.max(600, 1000 / (speed[0] ?? 1))}
                    label={`${graph.nodes.find(n => n.id === source)?.label ?? source} → ${graph.nodes.find(n => n.id === target)?.label ?? target}`}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}