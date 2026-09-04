import { Link } from "@tanstack/react-router";
import { Github, FileText, Route as RouteIcon, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card">
              <RouteIcon className="h-4 w-4 text-primary" />
            </span>
            <span className="font-display font-semibold">Smart Route Optimization</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            A Design and Analysis of Algorithms capstone project modeling road networks as weighted
            graphs and computing optimal routes with Dijkstra and Floyd–Warshall.
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            v1.0.0 · Academic Year 2025–26 · DAA Capstone
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Modules</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["Requirement Analysis", "/module-1"],
              ["Graph Modeling", "/module-2"],
              ["Shortest Path", "/module-3"],
              ["Route Optimization", "/module-4"],
              ["Testing & Roadmap", "/module-5"],
            ].map(([label, to]) => (
              <li key={to}>
                <Link
                  to={to!}
                  className="text-muted-foreground transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Project</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                to="/documentation"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <FileText className="h-3.5 w-3.5" /> Documentation
              </Link>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Github className="h-3.5 w-3.5" /> GitHub Repository
              </a>
            </li>
            <li>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" /> Developer Credits
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Smart Route Optimization. Built for academic evaluation.</p>
          <p className="font-mono">Dijkstra O((V+E) log V) · Floyd–Warshall O(V³)</p>
        </div>
      </div>
    </footer>
  );
}