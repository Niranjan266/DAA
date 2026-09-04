import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  Crosshair,
  Download,
  Eraser,
  FlaskConical,
  Globe,
  Grid3x3,
  Link2,
  Maximize,
  MousePointer2,
  Network,
  Plus,
  Server,
  Shuffle,
  Trash2,
  Upload,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  components,
  degreeStats,
  parseGraphText,
  sampleGraph,
  sampleGraphDense,
  sampleGraphNetwork,
  sampleGraphSmall,
  uid,
  type Graph,
  type GraphEdge,
  type GraphNode,
} from "@/lib/graph";

export const Route = createFileRoute("/_shell/module-2")({
  head: () => ({
    meta: [
      { title: "Module 2 · Graph Modeling and Data Preparation" },
      {
        name: "description",
        content:
          "Interactive graph builder: add nodes, connect weighted edges, validate connectivity and import or export CSV and JSON.",
      },
      { property: "og:title", content: "Module 2 · Graph Modeling and Data Preparation" },
      {
        property: "og:description",
        content: "Build, validate and export weighted directed or undirected graphs live.",
      },
    ],
  }),
  component: ModuleTwo,
});

type Mode = "select" | "add" | "connect" | "delete";

const W = 1000;
const H = 560;

// ─── Sample presets ─────────────────────────────────────────────────────────

const presets = [
  {
    id: "city",
    label: "City Map",
    icon: Building2,
    description: "8-node urban road network",
    load: sampleGraph,
    textInput: "A-B:4, A-E:6, B-C:3, B-F:5, C-D:4, C-G:6, D-H:3, E-F:4, F-G:3, G-H:5",
  },
  {
    id: "network",
    label: "Network Topology",
    icon: Server,
    description: "6-node router/switch layout",
    load: sampleGraphNetwork,
    textInput: "R-S1:1, R-S2:1, S1-P1:2, S1-P2:3, S1-S2:4, S2-Sv:2, S2-P2:3",
  },
  {
    id: "dense",
    label: "Dense Graph",
    icon: Globe,
    description: "10-node fully interconnected",
    load: sampleGraphDense,
    textInput: "A-B:2, A-C:7, B-C:3, B-D:5, C-E:4, C-F:6, D-E:2, D-G:8, E-F:1, E-H:5, F-G:3, F-I:4, G-H:2, G-J:6, H-I:3, I-J:2",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function ModuleTwo() {
  const [graph, setGraph] = useState<Graph>(() => sampleGraph());
  const [mode, setMode] = useState<Mode>("select");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("A-B:4, A-E:6, B-C:3, B-F:5, C-D:4, C-G:6, D-H:3, E-F:4, F-G:3, G-H:5");
  const [textError, setTextError] = useState("");
  const [activePreset, setActivePreset] = useState("city");
  const [showTextInput, setShowTextInput] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const stats = useMemo(() => degreeStats(graph), [graph]);
  const groups = useMemo(() => components(graph), [graph]);

  const issues = useMemo(() => {
    const list: { level: "error" | "warn"; text: string }[] = [];
    if (graph.edges.some((e) => e.weight <= 0))
      list.push({ level: "error", text: "Non-positive edge weight detected — Dijkstra requires w > 0." });
    if (graph.edges.some((e) => e.from === e.to))
      list.push({ level: "error", text: "Self-loop detected." });
    const seen = new Set<string>();
    for (const e of graph.edges) {
      const key = graph.directed ? `${e.from}>${e.to}` : [e.from, e.to].sort().join("-");
      if (seen.has(key)) list.push({ level: "warn", text: `Duplicate edge ${e.from}–${e.to}.` });
      seen.add(key);
    }
    if (groups.length > 1)
      list.push({ level: "warn", text: `Graph is disconnected — ${groups.length} components.` });
    const isolated = graph.nodes.filter(
      (n) => !graph.edges.some((e) => e.from === n.id || e.to === n.id),
    );
    if (isolated.length)
      list.push({ level: "warn", text: `Isolated node(s): ${isolated.map((n) => n.label).join(", ")}` });
    return list;
  }, [graph, groups]);

  const toPoint = useCallback((evt: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((evt.clientX - rect.left) / rect.width) * (W / zoom),
      y: ((evt.clientY - rect.top) / rect.height) * (H / zoom),
    };
  }, [zoom]);

  const addNodeAt = (x: number, y: number) => {
    const label = String.fromCharCode(65 + graph.nodes.length % 26) + (graph.nodes.length >= 26 ? Math.floor(graph.nodes.length / 26) : "");
    const node: GraphNode = { id: uid(), label, x, y };
    setGraph((g) => ({ ...g, nodes: [...g.nodes, node] }));
    toast.success(`Node ${label} added`);
  };

  const deleteNode = (id: string) => {
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.filter((n) => n.id !== id),
      edges: g.edges.filter((e) => e.from !== id && e.to !== id),
    }));
    setSelectedNode(null);
    toast("Node removed", { description: "Incident edges deleted too." });
  };

  const connect = (from: string, to: string) => {
    if (from === to) {
      toast.error("Self-loops are not allowed");
      return;
    }
    const edge: GraphEdge = { id: uid(), from, to, weight: 5 };
    setGraph((g) => ({ ...g, edges: [...g.edges, edge] }));
    setSelectedEdge(edge.id);
    toast.success("Edge created", { description: "Default weight 5 — edit in the inspector." });
  };

  const randomGraph = () => {
    const n = 7 + Math.floor(Math.random() * 5);
    const nodes: GraphNode[] = Array.from({ length: n }, (_, i) => ({
      id: uid(),
      label: String.fromCharCode(65 + i),
      x: 110 + Math.random() * (W - 220),
      y: 80 + Math.random() * (H - 160),
    }));
    const edges: GraphEdge[] = [];
    for (let i = 1; i < n; i++) {
      edges.push({
        id: uid(),
        from: nodes[i - 1]!.id,
        to: nodes[i]!.id,
        weight: 1 + Math.floor(Math.random() * 9),
      });
    }
    for (let k = 0; k < n; k++) {
      const a = nodes[Math.floor(Math.random() * n)]!;
      const b = nodes[Math.floor(Math.random() * n)]!;
      if (a.id !== b.id) edges.push({ id: uid(), from: a.id, to: b.id, weight: 1 + Math.floor(Math.random() * 9) });
    }
    setGraph({ nodes, edges, directed: graph.directed });
    setActivePreset("");
    toast.success("Random graph generated", { description: `${n} nodes · ${edges.length} edges` });
  };

  const exportFile = (kind: "json" | "csv") => {
    const content =
      kind === "json"
        ? JSON.stringify(graph, null, 2)
        : ["from,to,weight", ...graph.edges.map((e) => {
            const f = graph.nodes.find((n) => n.id === e.from)?.label ?? e.from;
            const t = graph.nodes.find((n) => n.id === e.to)?.label ?? e.to;
            return `${f},${t},${e.weight}`;
          })].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported graph.${kind}`);
  };

  const importFile = async (file: File) => {
    const text = await file.text();
    try {
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text) as Graph;
        if (!parsed.nodes || !parsed.edges) throw new Error("bad shape");
        setGraph({ ...parsed, directed: parsed.directed ?? false });
      } else {
        const rows = text.trim().split(/\r?\n/).slice(1);
        const nodeMap = new Map<string, GraphNode>();
        const edges: GraphEdge[] = [];
        rows.forEach((row, i) => {
          const [from, to, weight] = row.split(",").map((s) => s.trim());
          if (!from || !to) return;
          for (const label of [from, to]) {
            if (!nodeMap.has(label)) {
              const k = nodeMap.size;
              nodeMap.set(label, {
                id: label,
                label,
                x: 140 + (k % 5) * 180,
                y: 110 + Math.floor(k / 5) * 150,
              });
            }
          }
          edges.push({ id: `${from}-${to}-${i}`, from, to, weight: Number(weight) || 1 });
        });
        setGraph({ nodes: [...nodeMap.values()], edges, directed: graph.directed });
      }
      toast.success(`Imported ${file.name}`);
    } catch {
      toast.error("Import failed", { description: "Expected JSON graph or from,to,weight CSV." });
    }
  };

  const applyTextInput = () => {
    const result = parseGraphText(textInput, graph.directed);
    if (!result) {
      setTextError("Could not parse. Use format: A-B:4, B-C:3 or A->B:4 for directed.");
      return;
    }
    setTextError("");
    setGraph({ ...result, directed: graph.directed });
    setActivePreset("");
    toast.success(`Graph parsed`, { description: `${result.nodes.length} nodes · ${result.edges.length} edges` });
  };

  const loadPreset = (p: typeof presets[0]) => {
    setGraph(p.load());
    setTextInput(p.textInput);
    setActivePreset(p.id);
    setTextError("");
    toast.success(`Loaded: ${p.label}`, { description: p.description });
  };

  useEffect(() => {
    const up = () => setDragging(null);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  const node = graph.nodes.find((n) => n.id === selectedNode) ?? null;
  const edge = graph.edges.find((e) => e.id === selectedEdge) ?? null;

  const tools: { id: Mode; label: string; icon: typeof Plus }[] = [
    { id: "select", label: "Select / Drag", icon: MousePointer2 },
    { id: "add", label: "Add Node", icon: Plus },
    { id: "connect", label: "Connect", icon: Link2 },
    { id: "delete", label: "Delete", icon: Eraser },
  ];

  // edge path with slight curve for parallel edges
  const edgePath = (ax: number, ay: number, bx: number, by: number) => {
    return `M${ax},${ay} L${bx},${by}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Module 02"
        title="Graph Modeling and Data Preparation"
        description="Construct the network that every algorithm consumes: nodes, weighted edges, directionality, validation and interchange formats."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Module 2" },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">

        {/* ── Sample Presets ── */}
        <Reveal>
          <div className="card-elevated rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <FlaskConical className="h-4 w-4 text-primary" /> Sample Test Inputs
              </h2>
              <button
                onClick={() => setShowTextInput((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                  showTextInput ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" /> Text Input
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {presets.map((p) => (
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
                    {activePreset === p.id && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </button>
              ))}
            </div>

            {/* Text input panel */}
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
                      Enter edges in format: <code className="font-mono bg-surface px-1 py-0.5 rounded">A-B:4, B-C:3, ...</code> or directed: <code className="font-mono bg-surface px-1 py-0.5 rounded">A-&gt;B:4</code>
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={textInput}
                        onChange={(e) => { setTextInput(e.target.value); setTextError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyTextInput()}
                        placeholder="A-B:4, B-C:3, C-D:2, ..."
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        onClick={applyTextInput}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                      >
                        <Network className="h-3.5 w-3.5" /> Build
                      </button>
                    </div>
                    {textError && (
                      <p className="text-xs text-destructive">{textError}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {/* ── Toolbar ── */}
        <Reveal>
          <div className="card-elevated flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setMode(t.id);
                  setPendingFrom(null);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  mode === t.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
            <span className="mx-1 h-6 w-px bg-border" />
            <button onClick={() => setZoom((z) => Math.min(2, z * 1.2))} className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setZoom((z) => Math.max(0.6, z / 1.2))} className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setZoom(1)} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              <Maximize className="h-3.5 w-3.5" /> Fit view
            </button>
            <button
              onClick={() => setShowGrid((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs ${showGrid ? "text-primary" : "text-muted-foreground"}`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Grid
            </button>
            <span className="mx-1 h-6 w-px bg-border" />
            <label className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs">
              <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
              Directed
              <Switch
                checked={graph.directed}
                onCheckedChange={(v) => setGraph((g) => ({ ...g, directed: v }))}
              />
            </label>
            <button onClick={randomGraph} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              <Shuffle className="h-3.5 w-3.5" /> Random
            </button>
            <button onClick={() => { setGraph({ nodes: [], edges: [], directed: graph.directed }); setActivePreset(""); toast("Canvas cleared"); }} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
            <span className="mx-1 h-6 w-px bg-border" />
            <button onClick={() => exportFile("json")} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              <Download className="h-3.5 w-3.5" /> JSON
            </button>
            <button onClick={() => exportFile("csv")} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              <Upload className="h-3.5 w-3.5" /> Import
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </Reveal>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* ── Canvas ── */}
          <Reveal>
            <div className="card-elevated relative overflow-hidden rounded-2xl border border-border bg-card">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${W / zoom} ${H / zoom}`}
                className={`h-[520px] w-full ${showGrid ? "grid-bg" : ""} ${mode === "add" ? "cursor-crosshair" : ""}`}
                onClick={(e) => {
                  if (mode !== "add") return;
                  const p = toPoint(e);
                  addNodeAt(p.x, p.y);
                }}
                onPointerMove={(e) => {
                  if (!dragging || mode !== "select") return;
                  const p = toPoint(e);
                  setGraph((g) => ({
                    ...g,
                    nodes: g.nodes.map((n) => (n.id === dragging ? { ...n, x: p.x, y: p.y } : n)),
                  }));
                }}
              >
                <defs>
                  <marker id="dir-m2" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="var(--muted-foreground)" />
                  </marker>
                  <filter id="node-glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                {graph.edges.map((e) => {
                  const a = graph.nodes.find((n) => n.id === e.from);
                  const b = graph.nodes.find((n) => n.id === e.to);
                  if (!a || !b) return null;
                  const active = selectedEdge === e.id;
                  return (
                    <g key={e.id} className="cursor-pointer" onClick={(ev) => {
                      ev.stopPropagation();
                      if (mode === "delete") {
                        setGraph((g) => ({ ...g, edges: g.edges.filter((x) => x.id !== e.id) }));
                        toast("Edge deleted");
                      } else {
                        setSelectedEdge(e.id);
                        setSelectedNode(null);
                      }
                    }}>
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={active ? "var(--primary)" : "var(--border)"}
                        strokeWidth={active ? 3.5 : 2}
                        markerEnd={graph.directed ? "url(#dir-m2)" : undefined}
                        strokeOpacity={active ? 1 : 0.7}
                      />
                      {/* Hit area */}
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={12} />
                      <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={13}
                        fill={active ? "var(--primary)" : "var(--card)"}
                        stroke={active ? "var(--primary)" : "var(--border)"}
                        strokeWidth={1.5}
                      />
                      <text
                        x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4}
                        textAnchor="middle" fontSize={11}
                        fill={active ? "var(--primary-foreground)" : "var(--muted-foreground)"}
                        fontFamily="var(--font-mono)"
                      >
                        {e.weight}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {graph.nodes.map((n) => {
                  const active = selectedNode === n.id || pendingFrom === n.id;
                  return (
                    <motion.g
                      key={n.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="cursor-pointer"
                      onPointerDown={() => mode === "select" && setDragging(n.id)}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (mode === "delete") return deleteNode(n.id);
                        if (mode === "connect") {
                          if (!pendingFrom) setPendingFrom(n.id);
                          else {
                            connect(pendingFrom, n.id);
                            setPendingFrom(null);
                          }
                          return;
                        }
                        setSelectedNode(n.id);
                        setSelectedEdge(null);
                      }}
                    >
                      {/* Glow ring for active node */}
                      {active && (
                        <motion.circle
                          cx={n.x} cy={n.y} r={30}
                          fill="var(--primary)"
                          opacity={0}
                          animate={{ opacity: [0, 0.2, 0], r: [26, 34, 26] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <circle
                        cx={n.x} cy={n.y} r={22}
                        fill={active ? "var(--primary)" : "var(--card)"}
                        stroke="var(--primary)"
                        strokeWidth={active ? 2.5 : 1.5}
                        filter={active ? "url(#node-glow)" : undefined}
                      />
                      <text
                        x={n.x} y={n.y + 5}
                        textAnchor="middle" fontSize={13}
                        fill={active ? "var(--primary-foreground)" : "var(--card-foreground)"}
                        fontFamily="var(--font-mono)"
                        fontWeight="600"
                      >
                        {n.label}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>

              {/* Minimap */}
              <div className="pointer-events-none absolute right-3 bottom-3 h-24 w-36 overflow-hidden rounded-lg border border-border bg-background/80 backdrop-blur">
                <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
                  {graph.edges.map((e) => {
                    const a = graph.nodes.find((n) => n.id === e.from);
                    const b = graph.nodes.find((n) => n.id === e.to);
                    if (!a || !b) return null;
                    return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth={4} />;
                  })}
                  {graph.nodes.map((n) => (
                    <circle key={n.id} cx={n.x} cy={n.y} r={12} fill="var(--primary)" />
                  ))}
                </svg>
              </div>
              <span className="absolute top-3 left-3 rounded-lg border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
                {mode === "connect" && pendingFrom ? "Pick target node…" : `mode: ${mode} · zoom ${zoom.toFixed(1)}× · ${graph.nodes.length}V ${graph.edges.length}E`}
              </span>
            </div>
          </Reveal>

          {/* ── Side panels ── */}
          <div className="space-y-5">

            {/* Selected Node Spotlight */}
            <Reveal>
              <motion.div
                animate={{
                  borderColor: selectedNode
                    ? "rgba(99,102,241,0.5)"
                    : selectedEdge
                      ? "rgba(251,191,36,0.4)"
                      : "var(--border)",
                  boxShadow: selectedNode
                    ? ["0 0 0 0 rgba(99,102,241,0)", "0 0 0 8px rgba(99,102,241,0.12)", "0 0 0 0 rgba(99,102,241,0)"]
                    : selectedEdge
                      ? ["0 0 0 0 rgba(251,191,36,0)", "0 0 0 8px rgba(251,191,36,0.10)", "0 0 0 0 rgba(251,191,36,0)"]
                      : "none",
                }}
                transition={{ duration: 1.6, repeat: (selectedNode || selectedEdge) ? Infinity : 0 }}
                className="card-elevated rounded-2xl border bg-card p-5"
              >
                <h2 className="text-sm font-semibold mb-4">Graph Selection</h2>
                <AnimatePresence mode="wait">
                  {node ? (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.85, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="flex flex-col items-center gap-4"
                    >
                      {/* Node circle */}
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          className="absolute rounded-full bg-primary"
                          style={{ width: 72, height: 72 }}
                          animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                          className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-2 border-primary/70 bg-primary/15"
                        >
                          <span className="font-mono text-xl font-bold text-primary">{node.label}</span>
                        </motion.div>
                      </div>
                      <div className="w-full space-y-2">
                        <label className="block text-xs text-muted-foreground">
                          Label
                          <Input
                            value={node.label}
                            onChange={(e) =>
                              setGraph((g) => ({
                                ...g,
                                nodes: g.nodes.map((n) =>
                                  n.id === node.id ? { ...n, label: e.target.value } : n,
                                ),
                              }))
                            }
                            className="mt-1"
                          />
                        </label>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          x {node.x.toFixed(0)} · y {node.y.toFixed(0)}
                        </p>
                        <button
                          onClick={() => deleteNode(node.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete node
                        </button>
                      </div>
                    </motion.div>
                  ) : edge ? (
                    <motion.div
                      key={edge.id}
                      initial={{ opacity: 0, scale: 0.85, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="space-y-3"
                    >
                      {/* Edge visual */}
                      <div className="flex items-center justify-center gap-3 py-3">
                        <motion.span
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="grid h-10 w-10 place-items-center rounded-full border-2 border-warning/60 bg-warning/10 font-mono text-sm font-bold text-warning"
                        >
                          {graph.nodes.find((n) => n.id === edge.from)?.label}
                        </motion.span>
                        <motion.div
                          animate={{ scaleX: [1, 1.1, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="flex-1 h-0.5 bg-gradient-to-r from-warning/60 to-warning/60"
                        />
                        <motion.div
                          key={edge.weight}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="grid h-8 w-8 place-items-center rounded-full border border-warning/50 bg-warning/10 font-mono text-xs font-bold text-warning"
                        >
                          {edge.weight}
                        </motion.div>
                        <motion.div className="flex-1 h-0.5 bg-gradient-to-r from-warning/60 to-warning/60" />
                        <motion.span
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="grid h-10 w-10 place-items-center rounded-full border-2 border-warning/60 bg-warning/10 font-mono text-sm font-bold text-warning"
                        >
                          {graph.nodes.find((n) => n.id === edge.to)?.label}
                        </motion.span>
                      </div>
                      <label className="block text-xs text-muted-foreground">
                        Weight
                        <Input
                          type="number"
                          value={edge.weight}
                          onChange={(e) =>
                            setGraph((g) => ({
                              ...g,
                              edges: g.edges.map((x) =>
                                x.id === edge.id ? { ...x, weight: Number(e.target.value) } : x,
                              ),
                            }))
                          }
                          className="mt-1"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setGraph((g) => ({ ...g, edges: g.edges.filter((x) => x.id !== edge.id) }));
                          setSelectedEdge(null);
                          toast("Edge deleted");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete edge
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3 py-4 text-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="h-12 w-12 rounded-full border-2 border-dashed border-border"
                      />
                      <p className="text-xs text-muted-foreground">
                        Click a node or edge to inspect it
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Reveal>

            {/* Statistics Panel */}
            <Reveal delay={0.06}>
              <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">Statistics Panel</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Nodes", value: stats.n, isInt: true },
                    { label: "Edges", value: stats.m, isInt: true },
                    { label: "Avg. degree", value: stats.avgDegree, isInt: false },
                    { label: "Density", value: stats.density, isInt: false },
                  ].map(({ label, value, isInt }) => (
                    <motion.div
                      key={label}
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="rounded-xl border border-border bg-surface p-3 cursor-default"
                    >
                      <motion.p
                        key={String(value)}
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="font-display text-xl font-semibold"
                      >
                        {isInt ? value : Number(value).toFixed(label === "Density" ? 3 : 2)}
                      </motion.p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Connectivity</span>
                    <motion.span
                      key={groups.length}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={groups.length <= 1 ? "text-success font-medium" : "text-warning font-medium"}
                    >
                      {graph.nodes.length === 0
                        ? "empty"
                        : groups.length <= 1
                          ? "✓ connected"
                          : `⚠ ${groups.length} parts`}
                    </motion.span>
                  </div>
                  {/* Node/Edge fill bar */}
                  <div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        animate={{ width: `${Math.min(100, (stats.n / 20) * 100)}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{stats.n} / 20 nodes used</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Validation */}
            <Reveal delay={0.12}>
              <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Crosshair className="h-4 w-4 text-primary" /> Validation
                </h2>
                <AnimatePresence mode="wait">
                  {issues.length === 0 ? (
                    <motion.div
                      key="ok"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-2 w-2 rounded-full bg-success"
                      />
                      <p className="text-xs text-success">Graph ready for Module 3</p>
                    </motion.div>
                  ) : (
                    <motion.ul
                      key="issues"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 space-y-2"
                    >
                      {issues.map((i, idx) => (
                        <motion.li
                          key={i.text}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            i.level === "error"
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "border-warning/40 bg-warning/10 text-warning"
                          }`}
                        >
                          {i.text}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}