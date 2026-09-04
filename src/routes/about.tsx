import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageHeader } from "@/components/page-header";
import { Stagger, StaggerItem } from "@/components/reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Project | Smart Route Optimization" },
      {
        name: "description",
        content:
          "Scope, academic context and developer credits for the Smart Route Optimization graph algorithms capstone.",
      },
      { property: "og:title", content: "About the Project | Smart Route Optimization" },
      { property: "og:description", content: "Academic context and developer credits." },
    ],
  }),
  component: About,
});

const credits = [
  ["Project Lead & Algorithms", "Student Developer"],
  ["Frontend & Visualization", "Student Developer"],
  ["Testing & Documentation", "Student Developer"],
  ["Faculty Guide", "Course Instructor, DAA"],
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="pt-16">
        <PageHeader
          eyebrow="About"
          title="About the Project"
          description="A Design and Analysis of Algorithms capstone that turns classical shortest-path theory into a usable, measurable product."
          crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
        />
        <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6">
          <div className="card-elevated rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Scope</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Five delivered modules cover requirement analysis, graph modeling, algorithm
              visualization, optimization analytics and verification. Dijkstra handles
              single-source queries on sparse road networks; Floyd–Warshall provides the all-pairs
              baseline used for benchmarking and correctness cross-checks.
            </p>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {credits.map(([role, name]) => (
              <StaggerItem key={role}>
                <div className="card-elevated rounded-2xl border border-border bg-card p-5">
                  <p className="font-mono text-[11px] tracking-widest text-primary uppercase">{role}</p>
                  <p className="mt-2 text-sm font-medium">{name}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}