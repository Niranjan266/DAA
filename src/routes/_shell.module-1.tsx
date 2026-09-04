import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertTriangle,
  Ambulance,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Edit3,
  FlaskConical,
  Gauge,
  Navigation,
  Route as RouteIcon,
  ShieldCheck,
  Siren,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/reveal";

export const Route = createFileRoute("/_shell/module-1")({
  head: () => ({
    meta: [
      { title: "Module 1 · Requirement Analysis and Problem Definition" },
      {
        name: "description",
        content:
          "Problem statement, objectives, functional and non-functional requirements for the smart route optimization system.",
      },
      { property: "og:title", content: "Module 1 · Requirement Analysis and Problem Definition" },
      {
        property: "og:description",
        content: "Objectives, constraints and workflow definition for graph-based route optimization.",
      },
    ],
  }),
  component: ModuleOne,
});

// ─── Sample Problem Scenarios ─────────────────────────────────────────────────

const sampleScenarios = [
  {
    id: "urban",
    icon: Car,
    label: "Urban Traffic",
    color: "var(--chart-1)",
    problem:
      "Urban transportation networks are large, weighted and constantly changing. Drivers, dispatchers and emergency responders currently rely on intuition or static maps to choose routes, which produces longer trips, wasted fuel and missed service windows. There is no accessible tool that both computes the provably optimal route and explains how that route was derived. This project addresses that gap by modeling the network as a weighted graph and applying classical shortest-path algorithms with a transparent, step-by-step visual interface.",
  },
  {
    id: "emergency",
    icon: Ambulance,
    label: "Emergency Services",
    color: "var(--chart-4)",
    problem:
      "Emergency response times are critical — every second counts when dispatching ambulances, fire trucks or police units. Current CAD systems often rely on static routing tables that ignore real-time congestion. By modeling the road network as a weighted directed graph and continuously rerunning Dijkstra's algorithm against live edge weights, we can guarantee minimum-time corridors that adapt to incidents and reduce average response time by up to 30%.",
  },
  {
    id: "logistics",
    icon: Truck,
    label: "Logistics & Delivery",
    color: "var(--chart-2)",
    problem:
      "Last-mile delivery networks struggle with combinatorial route planning: a fleet of N vehicles must service M stops optimally. Manual planners cannot evaluate the O(M!) orderings at scale. By framing the problem as a shortest-path problem on a weighted graph — where nodes represent depots and drop-off points and edge weights encode distance, traffic and time-of-day costs — we can compute provably near-optimal delivery sequences and reduce per-parcel fuel spend by 15–22%.",
  },
];

// ─── Static data ──────────────────────────────────────────────────────────────

const objectives = [
  "Model any road network as a weighted graph G = (V, E, w)",
  "Compute provably optimal shortest paths between two locations",
  "Compare Dijkstra and Floyd–Warshall empirically and asymptotically",
  "Visualize every algorithmic step for teaching and evaluation",
  "Report distance, time and fuel savings after optimization",
  "Validate graphs for negative weights and disconnected components",
];

const problems = [
  {
    icon: Car,
    title: "Traffic Congestion",
    body: "Static routing ignores dynamic edge weights, so vehicles are funnelled into already saturated corridors.",
    stat: "+38% travel time in peak hours",
  },
  {
    icon: Clock,
    title: "Delivery Delays",
    body: "Manual multi-stop planning cannot evaluate the combinatorial number of viable orderings.",
    stat: "1 in 5 deliveries misses its window",
  },
  {
    icon: Droplets,
    title: "Fuel Consumption",
    body: "Every unnecessary kilometre translates directly into fuel burn, cost and CO₂ emissions.",
    stat: "~12% avoidable fuel spend",
  },
  {
    icon: Navigation,
    title: "Navigation Complexity",
    body: "Dense urban graphs with thousands of vertices are impossible to reason about without automation.",
    stat: "10⁴+ vertices in a mid-size city",
  },
];

const timeline = [
  { title: "Problem", body: "A driver needs the cheapest route between two points in a city.", icon: Target },
  { title: "Graph Representation", body: "Intersections → vertices, roads → weighted edges.", icon: RouteIcon },
  { title: "Algorithm", body: "Dijkstra for single-source, Floyd–Warshall for all-pairs.", icon: Cpu },
  { title: "Optimized Route", body: "Minimum-cost path with metrics and savings report.", icon: TrendingUp },
];

const applications = [
  { icon: Navigation, title: "GPS Navigation", body: "Real-time turn-by-turn guidance on live road graphs." },
  { icon: Truck, title: "Logistics", body: "Fleet dispatch and multi-drop delivery sequencing." },
  { icon: Siren, title: "Emergency Services", body: "Minimum-response-time corridors for ambulances." },
  { icon: UtensilsCrossed, title: "Food Delivery", body: "Courier assignment and hot-window routing." },
  { icon: Bike, title: "Ride Sharing", body: "Driver–rider matching and pooled trip routing." },
  { icon: Building2, title: "Smart Cities", body: "Signal timing, transit planning and load balancing." },
];

const functional = [
  {
    q: "FR-1 · Graph construction",
    a: "The system shall allow users to add, rename, move and delete nodes and to create weighted directed or undirected edges between them.",
  },
  {
    q: "FR-2 · Data import & export",
    a: "The system shall import graphs from CSV and JSON, and export the active graph, benchmarks and reports.",
  },
  {
    q: "FR-3 · Shortest path computation",
    a: "The system shall compute the shortest path between a selected source and destination using Dijkstra or Floyd–Warshall.",
  },
  {
    q: "FR-4 · Step-by-step visualization",
    a: "The system shall animate node states (current, visited, path, inactive) with play, pause, step-forward, step-backward and speed control.",
  },
  {
    q: "FR-5 · Analytics",
    a: "The system shall report execution time, memory usage, nodes traversed, total cost and savings versus the unoptimized route.",
  },
  {
    q: "FR-6 · Validation",
    a: "The system shall detect negative weights, self-loops, duplicate edges and disconnected components and surface actionable notifications.",
  },
];

const nonFunctional = [
  { icon: Gauge, title: "Performance", body: "Sub-50 ms Dijkstra runs on 200-vertex graphs; 60 FPS animation budget." },
  { icon: ShieldCheck, title: "Reliability", body: "Deterministic results, guarded against invalid input and unreachable targets." },
  { icon: TrendingUp, title: "Scalability", body: "Adjacency-list representation scales to 500+ vertices without UI degradation." },
  { icon: Wrench, title: "Maintainability", body: "Typed modules, pure algorithm core separated from rendering layers." },
];

const workflowSteps = [
  "User Input",
  "Graph Model",
  "Validation",
  "Algorithm",
  "Visualization",
  "Report",
];

// ─── Component ────────────────────────────────────────────────────────────────

function ModuleOne() {
  const [checked, setChecked] = useState<number[]>([0, 1, 2]);
  const [activeScenario, setActiveScenario] = useState<string>("urban");
  const [customProblem, setCustomProblem] = useState("");
  const [editingCustom, setEditingCustom] = useState(false);
  const [displayedProblem, setDisplayedProblem] = useState<string | null>(null);

  const currentScenario =
    sampleScenarios.find((s) => s.id === activeScenario) ?? sampleScenarios[0]!;

  const problemText = displayedProblem ?? currentScenario.problem;

  const applyCustom = () => {
    if (customProblem.trim()) {
      setDisplayedProblem(customProblem.trim());
      setEditingCustom(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Module 01"
        title="Requirement Analysis and Problem Definition"
        description="Defines the problem space, stakeholder objectives, constraints and the end-to-end workflow that the remaining modules implement."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Module 1" },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6">

        {/* ── Problem Statement ── */}
        <section>
          <SectionHeading eyebrow="Problem Statement" title="What this project solves" />

          {/* Scenario selector */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5" /> Sample scenarios:
            </span>
            {sampleScenarios.map((s) => {
              const active = activeScenario === s.id && !displayedProblem;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveScenario(s.id); setDisplayedProblem(null); setEditingCustom(false); }}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border ${
                    active
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              );
            })}
            <span className="mx-1 h-5 w-px bg-border" />
            <button
              onClick={() => { setEditingCustom((v) => !v); setDisplayedProblem(null); }}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                editingCustom
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" /> Custom
            </button>
          </div>

          {/* Custom input panel */}
          <AnimatePresence>
            {editingCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Write your own problem statement to replace the default text below.
                  </p>
                  <textarea
                    value={customProblem}
                    onChange={(e) => setCustomProblem(e.target.value)}
                    placeholder="Describe your routing problem here... e.g., 'Hospital dispatch needs fastest route to incident location...'"
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={applyCustom}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Apply
                    </button>
                    <button
                      onClick={() => { setEditingCustom(false); setCustomProblem(""); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Problem card */}
          <Reveal className="mt-4">
            <motion.div
              key={problemText}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="card-elevated rounded-2xl border border-border bg-card p-8"
            >
              <motion.span
                className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface text-primary"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <AlertTriangle className="h-5 w-5" />
              </motion.span>
              <h2 className="mt-5 text-2xl font-semibold">
                {displayedProblem ? "Custom Problem Statement" : currentScenario.label + " — Problem Statement"}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {problemText}
              </p>
              {displayedProblem && (
                <button
                  onClick={() => { setDisplayedProblem(null); setCustomProblem(""); }}
                  className="mt-4 text-xs text-primary underline underline-offset-2"
                >
                  ← Back to sample scenarios
                </button>
              )}
            </motion.div>
          </Reveal>
        </section>

        {/* ── Objectives ── */}
        <section>
          <SectionHeading eyebrow="Objectives" title="What the system must achieve" />
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
            {objectives.map((o, i) => {
              const done = checked.includes(i);
              return (
                <StaggerItem key={o}>
                  <button
                    onClick={() =>
                      setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))
                    }
                    className="card-elevated flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-lg"
                  >
                    <motion.span
                      animate={done ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        done ? "border-success bg-success/10 text-success" : "border-border text-transparent"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.span>
                    <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {o}
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>

        {/* ── Existing Problems ── */}
        <section>
          <SectionHeading eyebrow="Existing Problems" title="What goes wrong today" />
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((p) => (
              <StaggerItem key={p.title}>
                <div className="card-elevated group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 duration-200">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-primary transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <p.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  <p className="mt-4 font-mono text-xs text-primary">{p.stat}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── Proposed Solution ── */}
        <section>
          <SectionHeading eyebrow="Proposed Solution" title="Problem to optimized route" />
          <div className="relative mt-12">
            <div className="absolute top-6 left-6 hidden h-[calc(100%-3rem)] w-px bg-border lg:left-1/2 lg:block" />
            <div className="space-y-6">
              {timeline.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`lg:w-1/2 ${i % 2 ? "lg:ml-auto lg:pl-10" : "lg:pr-10"}`}
                >
                  <div className="card-elevated rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <motion.span
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-primary/12 text-primary"
                      >
                        <t.icon className="h-4 w-4" />
                      </motion.span>
                      <div>
                        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                          Step 0{i + 1}
                        </p>
                        <h3 className="text-base font-semibold">{t.title}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Applications ── */}
        <section>
          <SectionHeading eyebrow="Applications" title="Who benefits" />
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((a) => (
              <StaggerItem key={a.title}>
                <div className="card-elevated group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 duration-200">
                  <a.icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mt-4 text-base font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── Functional Requirements ── */}
        <section>
          <SectionHeading eyebrow="Functional Requirements" title="Behaviour the system guarantees" />
          <Reveal className="mt-10">
            <Accordion
              type="single"
              collapsible
              className="rounded-2xl border border-border bg-card px-4"
            >
              {functional.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>

        {/* ── Non-Functional Requirements ── */}
        <section>
          <SectionHeading eyebrow="Non Functional Requirements" title="Quality attributes" />
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nonFunctional.map((n) => (
              <StaggerItem key={n.title}>
                <div className="card-elevated group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg">
                  <n.icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mt-4 text-base font-semibold">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── Animated Workflow Diagram ── */}
        <section>
          <SectionHeading eyebrow="Workflow Diagram" title="End-to-end system flow" />
          <Reveal className="mt-10">
            <div className="grid-bg overflow-hidden rounded-2xl border border-border bg-card p-6">
              <svg viewBox="0 0 1020 200" className="h-auto w-full">
                <defs>
                  <marker id="arrow-m1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="var(--primary)" />
                  </marker>
                  <filter id="glow-m1">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {workflowSteps.map((label, i) => {
                  const x = 20 + i * 165;
                  return (
                    <motion.g
                      key={label}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Glow behind active rect */}
                      <motion.rect
                        x={x}
                        y={68}
                        width={140}
                        height={64}
                        rx={14}
                        fill="var(--primary)"
                        opacity={0}
                        animate={{ opacity: [0, 0.12, 0] }}
                        transition={{ delay: i * 0.4, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        filter="url(#glow-m1)"
                      />
                      <rect
                        x={x}
                        y={68}
                        width={140}
                        height={64}
                        rx={14}
                        fill="var(--surface)"
                        stroke="var(--primary)"
                        strokeOpacity={0.55}
                      />
                      <text
                        x={x + 70}
                        y={96}
                        textAnchor="middle"
                        fontSize={11}
                        fill="var(--muted-foreground)"
                        fontFamily="var(--font-mono)"
                      >
                        {`0${i + 1}`}
                      </text>
                      <text
                        x={x + 70}
                        y={114}
                        textAnchor="middle"
                        fontSize={13}
                        fill="var(--card-foreground)"
                        fontWeight="600"
                      >
                        {label}
                      </text>
                      {i < 5 && (
                        <motion.line
                          x1={x + 142}
                          y1={100}
                          x2={x + 163}
                          y2={100}
                          stroke="var(--primary)"
                          strokeWidth={2}
                          markerEnd="url(#arrow-m1)"
                          initial={{ pathLength: 0, opacity: 0 }}
                          whileInView={{ pathLength: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                        />
                      )}
                    </motion.g>
                  );
                })}
              </svg>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}