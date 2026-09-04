import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
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
  ArrowUpRight,
  Circle,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Network,
  Play,
  Plus,
  Route as RouteIcon,
  Upload,
  Waypoints,
  Zap,
} from "lucide-react";
import { GraphNetwork } from "@/components/graph-network";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { sampleGraph } from "@/lib/graph";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Analytics Dashboard | Smart Route Optimization" },
      {
        name: "description",
        content:
          "Live analytics for graph size, algorithm performance, execution time and project progress.",
      },
      { property: "og:title", content: "Analytics Dashboard | Smart Route Optimization" },
      {
        property: "og:description",
        content: "Graph statistics, algorithm benchmarks and project progress in one control panel.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Graph Nodes", value: "48", delta: "+6 this session", icon: Network },
  { label: "Edges", value: "126", delta: "+14 this session", icon: Waypoints },
  { label: "Algorithms", value: "2", delta: "Dijkstra · Floyd–Warshall", icon: Zap },
  { label: "Saved Graphs", value: "9", delta: "3 exported", icon: Database },
];

const execData = [
  { size: "10", dijkstra: 0.4, floyd: 1.1 },
  { size: "25", dijkstra: 1.2, floyd: 6.4 },
  { size: "50", dijkstra: 2.9, floyd: 28.7 },
  { size: "100", dijkstra: 6.8, floyd: 176.2 },
  { size: "200", dijkstra: 15.4, floyd: 1180.5 },
  { size: "400", dijkstra: 34.1, floyd: 8460.0 },
];

const complexity = [
  { n: "V=10", dijkstra: 33, floyd: 100 },
  { n: "V=50", dijkstra: 282, floyd: 125000 },
  { n: "V=100", dijkstra: 664, floyd: 1000000 },
  { n: "V=200", dijkstra: 1528, floyd: 8000000 },
];

const perf = [
  { name: "Dijkstra", value: 62 },
  { name: "Floyd–Warshall", value: 28 },
  { name: "Preprocessing", value: 10 },
];

const activities = [
  { title: "Dijkstra executed on graph #14", meta: "Source A → Destination H · 12 ms", tone: "primary" },
  { title: "Random graph generated", meta: "32 nodes · 78 edges", tone: "success" },
  { title: "Floyd–Warshall matrix computed", meta: "All-pairs · 176 ms", tone: "warning" },
  { title: "Analytics report exported", meta: "module-4-report.csv", tone: "primary" },
  { title: "Disconnected component detected", meta: "Validation warning on graph #12", tone: "destructive" },
];

const progress = [
  { label: "Module 1 · Requirement Analysis", value: 100 },
  { label: "Module 2 · Graph Modeling", value: 100 },
  { label: "Module 3 · Shortest Path", value: 96 },
  { label: "Module 4 · Optimization", value: 88 },
  { label: "Module 5 · Testing", value: 74 },
];

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)"];

function Card({
  children,
  className = "",
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`card-elevated rounded-2xl border border-border bg-card p-5 ${className}`}>
      {title && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const graph = sampleGraph();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8">
          <GraphNetwork className="absolute inset-0 opacity-60" density={26} />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <span className="font-mono text-[11px] tracking-widest text-primary uppercase">
              Control Center
            </span>
            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Welcome back — your graphs are ready
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Monitor algorithm performance, inspect saved networks and jump straight into the
              visualizer.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/module-3"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Play className="h-4 w-4" /> Run visualizer
              </Link>
              <Link
                to="/module-2"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:border-primary/50"
              >
                <Plus className="h-4 w-4" /> Build a graph
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="card-elevated group h-full rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-primary transition-transform group-hover:scale-110">
                  <s.icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
              {loading ? (
                <Skeleton className="mt-4 h-8 w-20" />
              ) : (
                <p className="mt-4 font-display text-3xl font-semibold">{s.value}</p>
              )}
              <p className="mt-1 text-sm font-medium">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.delta}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card title="Execution Time Chart" subtitle="Milliseconds vs. graph size (V)">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={execData}>
                    <defs>
                      <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="size" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="dijkstra"
                      name="Dijkstra (ms)"
                      stroke="var(--chart-1)"
                      fill="url(#gD)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="floyd"
                      name="Floyd–Warshall (ms)"
                      stroke="var(--chart-4)"
                      fill="url(#gF)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card title="Algorithm Performance Overview" subtitle="Share of total compute time">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={perf}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    stroke="var(--card)"
                  >
                    {perf.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card
            title="Interactive Graph Preview"
            subtitle={`${graph.nodes.length} nodes · ${graph.edges.length} edges`}
            action={
              <Link
                to="/module-2"
                className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary/60 hover:text-primary"
              >
                Open builder
              </Link>
            }
          >
            <div className="grid-bg relative h-72 overflow-hidden rounded-xl border border-border bg-surface">
              <svg viewBox="0 0 900 420" className="h-full w-full">
                {graph.edges.map((e, i) => {
                  const a = graph.nodes.find((n) => n.id === e.from)!;
                  const b = graph.nodes.find((n) => n.id === e.to)!;
                  return (
                    <motion.line
                      key={e.id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="var(--border)"
                      strokeWidth={2}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  );
                })}
                {graph.nodes.map((n, i) => (
                  <motion.g
                    key={n.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 200 }}
                  >
                    <circle cx={n.x} cy={n.y} r={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
                    <text
                      x={n.x}
                      y={n.y + 5}
                      textAnchor="middle"
                      fontSize={13}
                      fill="var(--card-foreground)"
                      fontFamily="var(--font-mono)"
                    >
                      {n.label}
                    </text>
                  </motion.g>
                ))}
              </svg>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card title="Recent Activities" subtitle="Last 24 hours">
            <ul className="space-y-3">
              {activities.map((a, i) => (
                <motion.li
                  key={a.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary/50"
                >
                  <Circle
                    className="mt-1 h-2.5 w-2.5 shrink-0 fill-current"
                    style={{ color: `var(--${a.tone})` }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.meta}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card title="Complexity Comparison Chart" subtitle="Theoretical operation counts (log scale)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complexity}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="n" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis scale="log" domain={[1, "auto"]} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="dijkstra" name="(V+E)logV" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="floyd" name="V³" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card title="Nodes Traversed Trend" subtitle="Across the last 8 executions">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Array.from({ length: 8 }, (_, i) => ({
                    run: `#${i + 1}`,
                    traversed: 18 + Math.round(Math.sin(i) * 6) + i * 3,
                    relaxed: 42 + Math.round(Math.cos(i) * 9) + i * 5,
                  }))}
                >
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="run" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="traversed"
                    name="Nodes visited"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="relaxed"
                    name="Edges relaxed"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <Card title="Project Progress Tracker" subtitle="Module completion">
            <div className="space-y-4">
              {progress.map((p, i) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{p.label}</span>
                    <span className="font-mono text-muted-foreground">{p.value}%</span>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    style={{ transformOrigin: "left" }}
                    className="mt-2"
                  >
                    <Progress value={p.value} className="h-1.5" />
                  </motion.div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card title="Quick Actions" subtitle="Common workflows">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New graph", icon: Plus, to: "/module-2" },
                { label: "Run Dijkstra", icon: Play, to: "/module-3" },
                { label: "Benchmark", icon: Zap, to: "/module-4" },
                { label: "Test suite", icon: RouteIcon, to: "/module-5" },
              ].map((q) => (
                <Link
                  key={q.label}
                  to={q.to}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <q.icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium">{q.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.16}>
          <Card title="Storage Usage" subtitle="Local persistence">
            <p className="font-display text-3xl font-semibold">
              64<span className="text-sm text-muted-foreground"> / 100 MB</span>
            </p>
            <Progress value={64} className="mt-4 h-2" />
            <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
              {[
                ["Saved graphs", "38 MB"],
                ["Benchmark logs", "18 MB"],
                ["Exports & reports", "8 MB"],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-mono">{v}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card title="Export Options" subtitle="Download graphs, benchmarks and reports">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Export JSON", icon: FileJson },
              { label: "Export CSV", icon: FileSpreadsheet },
              { label: "Export PDF report", icon: FileText },
              { label: "Import graph", icon: Upload },
            ].map((e) => (
              <button
                key={e.label}
                onClick={() => toast.success(`${e.label} queued`, { description: "Demo action" })}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50"
              >
                <e.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{e.label}</span>
                <Download className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
              </button>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}