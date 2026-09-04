import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Reveal, SectionHeading, Stagger, StaggerItem } from "@/components/reveal";

export const Route = createFileRoute("/_shell/documentation")({
  head: () => ({
    meta: [
      { title: "Documentation | Smart Route Optimization" },
      {
        name: "description",
        content:
          "How the graph model, Dijkstra and Floyd–Warshall implementations, data formats and modules fit together.",
      },
      { property: "og:title", content: "Documentation | Smart Route Optimization" },
      {
        property: "og:description",
        content: "Data formats, algorithm notes and module reference for the project.",
      },
    ],
  }),
  component: Documentation,
});

const sections = [
  {
    title: "Graph model",
    body: "A graph is { nodes: {id,label,x,y}[], edges: {id,from,to,weight}[], directed: boolean }. Adjacency is derived on demand, so undirected graphs simply traverse each edge in both directions.",
  },
  {
    title: "Dijkstra",
    body: "Greedy extraction of the minimum tentative distance, followed by edge relaxation. Every relaxation is recorded as a snapshot so the UI can step forward and backward without recomputation. Requires non-negative weights.",
  },
  {
    title: "Floyd–Warshall",
    body: "Triple-nested dynamic programming over all intermediate vertices k, producing a full distance matrix plus a successor matrix used to reconstruct any pair's path in O(V).",
  },
  {
    title: "CSV format",
    body: "Header row from,to,weight followed by one edge per line. Nodes are created implicitly from the labels found in the file and auto-positioned on a grid.",
  },
  {
    title: "JSON format",
    body: "Exported files round-trip exactly: the same object shape used internally, including node coordinates and the directed flag.",
  },
];

function Documentation() {
  return (
    <div>
      <PageHeader
        eyebrow="Reference"
        title="Documentation"
        description="Everything needed to reproduce, extend or evaluate the project."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Documentation" },
        ]}
      />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6">
        <SectionHeading eyebrow="Concepts" title="Implementation notes" />
        <Stagger className="space-y-4">
          {sections.map((s) => (
            <StaggerItem key={s.title}>
              <div className="card-elevated rounded-2xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold">Module reference</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["Module 1 — Requirement analysis", "/module-1"],
                ["Module 2 — Graph builder", "/module-2"],
                ["Module 3 — Shortest path visualizer", "/module-3"],
                ["Module 4 — Optimization analytics", "/module-4"],
                ["Module 5 — Testing & roadmap", "/module-5"],
                ["Settings", "/settings"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to!} className="text-muted-foreground transition-colors hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}