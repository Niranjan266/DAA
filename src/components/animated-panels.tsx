/**
 * Shared animated UI components used across all modules.
 */
import { motion, useSpring, useTransform, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Animated numeric counter ─────────────────────────────────────────────────

export function AnimatedNumber({
  value,
  className = "",
  decimals = 0,
  infinity = false,
}: {
  value: number;
  className?: string;
  decimals?: number;
  infinity?: boolean;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (infinity || !isFinite(value)) {
      setDisplay(value);
      return;
    }
    if (ref.current) ref.current.stop();
    ref.current = animate(display, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!isFinite(value)) return <span className={className}>∞</span>;
  return (
    <span className={className}>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
    </span>
  );
}

// ─── Glowing pulse ring around a node badge ──────────────────────────────────

export function NodeSpotlight({
  label,
  dist,
  state = "current",
  size = "lg",
}: {
  label: string;
  dist: number | string;
  state?: "current" | "path" | "visited" | "idle";
  size?: "sm" | "lg";
}) {
  const color =
    state === "current"
      ? "var(--warning)"
      : state === "path"
        ? "var(--success)"
        : "var(--primary)";
  const bgOpacity = state === "current" ? "bg-warning/15 border-warning/60" :
    state === "path" ? "bg-success/15 border-success/60" : "bg-primary/15 border-primary/60";
  const textColor = state === "current" ? "text-warning" :
    state === "path" ? "text-success" : "text-primary";

  const circleSize = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const textSize = size === "lg" ? "text-xl" : "text-sm";

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* Outer pulse ring 1 */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: color, width: size === "lg" ? 80 : 52, height: size === "lg" ? 80 : 52 }}
        animate={{ scale: [1, 1.6, 1.6], opacity: [0.35, 0, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
      />
      {/* Outer pulse ring 2 (offset) */}
      <motion.div
        className="absolute rounded-full"
        style={{ background: color, width: size === "lg" ? 80 : 52, height: size === "lg" ? 80 : 52 }}
        animate={{ scale: [1, 1.6, 1.6], opacity: [0.25, 0, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
      />
      {/* Node circle */}
      <motion.div
        className={`relative grid ${circleSize} place-items-center rounded-full border-2 ${bgOpacity}`}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className={`font-mono ${textSize} font-bold ${textColor}`}>{label}</span>
      </motion.div>
      {/* Distance badge */}
      <div className="text-center">
        <motion.p
          key={String(dist)}
          initial={{ scale: 0.6, opacity: 0, y: 4 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`font-mono text-2xl font-bold ${textColor}`}
        >
          {dist === Infinity || dist === "∞" ? "∞" : dist}
        </motion.p>
        <p className="mt-0.5 text-[10px] text-muted-foreground uppercase tracking-widest">distance</p>
      </div>
    </div>
  );
}

// ─── Animated step feed item ──────────────────────────────────────────────────

export function StepFeedItem({
  note,
  index,
}: {
  note: string;
  index: number;
}) {
  return (
    <motion.div
      key={note + index}
      initial={{ opacity: 0, x: 24, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground"
    >
      <span className="mr-2 font-mono text-primary/60">#{index + 1}</span>
      {note}
    </motion.div>
  );
}

// ─── Animated stat card ───────────────────────────────────────────────────────

export function AnimatedStatCard({
  label,
  value,
  decimals = 0,
  className = "",
  highlight = false,
}: {
  label: string;
  value: number;
  decimals?: number;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`rounded-xl border bg-surface p-3 cursor-default ${
        highlight ? "border-primary/40 shadow-sm shadow-primary/10" : "border-border"
      } ${className}`}
    >
      <AnimatedNumber
        value={value}
        decimals={decimals}
        className="block font-display text-xl font-semibold text-foreground"
      />
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────

export function AnimatedBar({
  value,
  max = 100,
  color = "var(--primary)",
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  label?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-mono">{value}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Pulsing active border wrapper ────────────────────────────────────────────

export function ActiveCard({
  children,
  active = false,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        boxShadow: active
          ? ["0 0 0 0 rgba(251,191,36,0)", "0 0 0 6px rgba(251,191,36,0.18)", "0 0 0 0 rgba(251,191,36,0)"]
          : "none",
        borderColor: active ? "rgba(251,191,36,0.5)" : "var(--border)",
      }}
      transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
      className={`card-elevated rounded-2xl border bg-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
