import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Cpu,
  Gauge,
  GitBranch,
  Layers,
  Network,
  Play,
  Radar,
  Route as RouteIcon,
  ShieldCheck,
  Siren,
  Sparkles,
  Timer,
  Truck,
  Workflow,
} from "lucide-react";
import { GraphNetwork } from "@/components/graph-network";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Route Optimization Using Graph Algorithms | DAA Capstone" },
      {
        name: "description",
        content:
          "An interactive suite that models road networks as weighted graphs and computes optimal shortest paths using Dijkstra and Floyd–Warshall.",
      },
      { property: "og:title", content: "Smart Route Optimization Using Graph Algorithms" },
      {
        property: "og:description",
        content:
          "Visualize, benchmark and optimize shortest paths with Dijkstra and Floyd–Warshall.",
      },
    ],
  }),
  component: Landing,
});

const metrics = [
  { label: "Algorithms Implemented", value: 2, suffix: "", icon: Cpu, note: "Dijkstra · Floyd–Warshall" },
  { label: "Graph Nodes Supported", value: 500, suffix: "+", icon: Network, note: "Sparse & dense graphs" },
  { label: "Real-Time Visualization", value: 60, suffix: " FPS", icon: Radar, note: "Step-by-step traversal" },
  { label: "Execution Speed", value: 12, suffix: " ms", icon: Timer, note: "Avg. on 100-node graph" },
];

function useCountUp(target: number, run: boolean, duration = 1300) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

function MetricCard({ m, index, ready }: { m: (typeof metrics)[number]; index: number; ready: boolean }) {
  const value = useCountUp(m.value, ready);
  const Icon = m.icon;
  return (
    <StaggerItem>
      <div className="card-elevated group h-full rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-primary">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            0{index + 1}
          </span>
        </div>
        {ready ? (
          <p className="mt-5 font-display text-3xl font-semibold">
            {value}
            <span className="text-primary">{m.suffix}</span>
          </p>
        ) : (
          <Skeleton className="mt-5 h-9 w-24" />
        )}
        <p className="mt-1 text-sm font-medium">{m.label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
      </div>
    </StaggerItem>
  );
}

const features = [
  { icon: Network, title: "Interactive Graph Builder", body: "Drag nodes, draw weighted edges, switch between directed and undirected models, and validate connectivity live." },
  { icon: Play, title: "Step Visualizer", body: "Play, pause, step forward or backward through Dijkstra relaxations with priority-queue and distance-table inspection." },
  { icon: Gauge, title: "Performance Analytics", body: "Execution time, memory footprint, nodes traversed and complexity comparison rendered as live charts." },
  { icon: Layers, title: "All-Pairs Matrices", body: "Floyd–Warshall dynamic programming with an animated distance matrix and predecessor reconstruction." },
  { icon: ShieldCheck, title: "Validation Engine", body: "Negative-weight detection, disconnected component warnings and edge-case guards with animated notifications." },
  { icon: Workflow, title: "Import / Export", body: "CSV and JSON graph interchange plus exportable analytics and testing reports." },
];

const tech = [
  ["React 19", "UI runtime"],
  ["TanStack Router", "Type-safe routing"],
  ["TypeScript", "Static typing"],
  ["Tailwind CSS v4", "Design system"],
  ["Motion", "Animation engine"],
  ["Recharts", "Data visualization"],
  ["Canvas / SVG", "Graph rendering"],
  ["Dijkstra & DP", "Algorithm core"],
];

const applications = [
  { icon: RouteIcon, title: "GPS Navigation", body: "Turn-by-turn shortest path computation over live road graphs." },
  { icon: Truck, title: "Logistics & Fleet", body: "Multi-stop delivery routing that minimizes distance and fuel." },
  { icon: Siren, title: "Emergency Response", body: "Fastest ambulance and fire-response corridors under congestion." },
  { icon: Boxes, title: "Smart Cities", body: "Traffic signal planning and infrastructure load balancing." },
];

const comparison = [
  { k: "Strategy", d: "Greedy + min-heap", f: "Dynamic programming" },
  { k: "Time complexity", d: "O((V + E) log V)", f: "O(V³)" },
  { k: "Space complexity", d: "O(V + E)", f: "O(V²)" },
  { k: "Scope", d: "Single source", f: "All pairs" },
  { k: "Negative weights", d: "Not supported", f: "Supported (no negative cycles)" },
  { k: "Best for", d: "Large sparse road networks", f: "Small dense networks" },
];

const architecture = [
  { layer: "Presentation", items: ["Landing", "Dashboard", "Module pages"] },
  { layer: "Visualization", items: ["Canvas renderer", "Recharts", "Motion timeline"] },
  { layer: "Algorithm core", items: ["Dijkstra", "Floyd–Warshall", "Step recorder"] },
  { layer: "Data layer", items: ["Graph model", "CSV / JSON I/O", "Local persistence"] },
];

function Landing() {
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <motion.div style={{ y, opacity: fade }} className="absolute inset-0">
          <div className="absolute inset-0 grid-bg opacity-70" />
          <div className="absolute inset-0 hero-glow" />
          <GraphNetwork className="absolute inset-0 opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Design and Analysis of Algorithms · Capstone Project
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold sm:text-6xl lg:text-7xl">
              Smart Route Optimization{" "}
              <span className="text-gradient">Using Graph Algorithms</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              An end-to-end application that models real road networks as weighted graphs, then
              visualizes and optimizes shortest paths using Dijkstra and Floyd–Warshall — with
              step-by-step traversal, live complexity analysis and exportable performance reports.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}
              >
                Launch Project
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/module-3"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <Play className="h-4 w-4 text-primary" /> Watch the visualizer
              </Link>
            </div>
          </motion.div>

          <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" delay={0.25}>
            {metrics.map((m, i) => (
              <MetricCard key={m.label} m={m} index={i} ready={ready} />
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Project Overview"
            title="From city map to optimal corridor"
            description="Intersections become vertices, roads become weighted edges, and travel cost becomes the metric we minimize. The suite walks through the full engineering lifecycle of that idea."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <div className="card-elevated relative overflow-hidden rounded-2xl border border-border bg-card p-8">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="relative">
                  <h3 className="text-xl font-semibold">Why graph theory</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Urban navigation is a constrained optimization problem. Representing the network
                    as G = (V, E, w) lets us reason formally about cost, reachability and
                    connectivity — and lets us prove the optimality of the routes we return rather
                    than guessing at them.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      ["V", "Intersections / stops"],
                      ["E", "Road segments"],
                      ["w(e)", "Distance, time or fuel"],
                    ].map(([sym, label]) => (
                      <div key={sym} className="rounded-xl border border-border bg-surface p-4">
                        <p className="font-mono text-lg text-primary">{sym}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="card-elevated h-full rounded-2xl border border-border bg-card p-8">
                <GitBranch className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Five delivered modules</h3>
                <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {[
                    "Requirement analysis & problem definition",
                    "Graph modeling & data preparation",
                    "Shortest path algorithm visualizer",
                    "Route optimization & performance analysis",
                    "Testing results & future enhancements",
                  ].map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="font-mono text-xs text-primary">0{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Features" title="Built like a product, not a demo" />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="card-elevated group h-full rounded-2xl border border-border bg-card p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-primary transition-transform group-hover:scale-110">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Technologies Used" title="A modern, typed frontend stack" />
          <Stagger className="mt-10 flex flex-wrap gap-3" step={0.05}>
            {tech.map(([name, role]) => (
              <StaggerItem key={name}>
                <div className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/50">
                  <span className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-150" />
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{role}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Real-World Applications"
            title="Where these algorithms already run"
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {applications.map((a) => (
              <StaggerItem key={a.title}>
                <div className="card-elevated h-full rounded-2xl border border-border bg-card p-6">
                  <a.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Algorithm Comparison Preview"
            title="Dijkstra versus Floyd–Warshall"
            description="The full benchmark lives in Module 4. Here is the analytical summary."
          />
          <Reveal className="mt-12">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-3 gap-4 border-b border-border bg-surface px-6 py-4 text-xs font-semibold tracking-widest uppercase">
                <span className="text-muted-foreground">Criterion</span>
                <span>Dijkstra</span>
                <span>Floyd–Warshall</span>
              </div>
              {comparison.map((row, i) => (
                <motion.div
                  key={row.k}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="grid grid-cols-3 gap-4 px-6 py-4 text-sm transition-colors hover:bg-secondary/60"
                >
                  <span className="text-muted-foreground">{row.k}</span>
                  <span className="font-mono text-xs sm:text-sm">{row.d}</span>
                  <span className="font-mono text-xs sm:text-sm">{row.f}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Project Architecture Preview" title="Four cooperating layers" />
          <Stagger className="mt-12 space-y-4">
            {architecture.map((a, i) => (
              <StaggerItem key={a.layer}>
                <div className="card-elevated grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-6 sm:flex sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] tracking-widest text-primary uppercase">
                      Layer 0{i + 1}
                    </p>
                    <h3 className="mt-1 truncate text-lg font-semibold">{a.layer}</h3>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-2 sm:col-auto">
                    {a.items.map((it) => (
                      <span
                        key={it}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-14">
            <div
              className="relative overflow-hidden rounded-3xl border border-border p-10 text-center"
              style={{ background: "var(--gradient-hero)" }}
            >
              <h3 className="text-2xl font-semibold sm:text-3xl">Ready to explore the suite?</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                Open the analytics dashboard, build a graph, then watch the algorithms run
                step-by-step.
              </p>
              <Link
                to="/dashboard"
                className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--gradient-primary)" }}
              >
                Launch Project <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
