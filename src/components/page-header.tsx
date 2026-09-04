import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { GraphNetwork } from "./graph-network";

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-surface">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <GraphNetwork className="absolute inset-0 opacity-50" density={22} linkDistance={150} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {crumbs.length > 0 && (
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <div className="min-w-0">
            {eyebrow && (
              <span className="font-mono text-[11px] tracking-widest text-primary uppercase">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}