/**
 * TravelerAnimation — 3D perspective map that animates a traveler
 * moving node-by-node along a shortest path.
 *
 * The SVG is drawn in a flat 2D coordinate space and then
 * a CSS perspective + rotateX transform creates the 3D tilt.
 */
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Graph } from "@/lib/graph";

// ─── constants ────────────────────────────────────────────────────────────────

const W = 340;
const H = 200;
const PAD = 30;

// ─── helpers ──────────────────────────────────────────────────────────────────

type Pt = { x: number; y: number };

function normalize(nodes: Graph["nodes"]): Record<string, Pt> {
  if (!nodes.length) return {};
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rngX = maxX - minX || 1;
  const rngY = maxY - minY || 1;
  return Object.fromEntries(
    nodes.map((n) => [
      n.id,
      {
        x: PAD + ((n.x - minX) / rngX) * (W - 2 * PAD),
        y: PAD + ((n.y - minY) / rngY) * (H - 2 * PAD),
      },
    ]),
  );
}

// ─── PersonIcon ───────────────────────────────────────────────────────────────

function PersonIcon({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Head */}
      <circle cx={cx} cy={cy - 5} r={3.5} fill="white" />
      {/* Body */}
      <line x1={cx} y1={cy - 1.5} x2={cx} y2={cy + 4} stroke="white" strokeWidth={2} strokeLinecap="round" />
      {/* Arms */}
      <line x1={cx - 3} y1={cy + 1} x2={cx + 3} y2={cy + 1} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
      {/* Legs */}
      <line x1={cx} y1={cy + 4} x2={cx - 2.5} y2={cy + 8} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
      <line x1={cx} y1={cy + 4} x2={cx + 2.5} y2={cy + 8} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  );
}

// ─── StarIcon ─────────────────────────────────────────────────────────────────

function StarIcon({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180);
    const ai = ((i * 72 + 36 - 90) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} ${cx + (r * 0.45) * Math.cos(ai)},${cy + (r * 0.45) * Math.sin(ai)}`;
  }).join(" ");
  return <polygon points={pts} fill="var(--warning)" stroke="white" strokeWidth={0.8} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  graph: Graph;
  path: string[];          // ordered node IDs
  stepMs?: number;         // ms per segment
  label?: string;
  compact?: boolean;
}

export function TravelerAnimation({
  graph,
  path,
  stepMs = 900,
  label = "Route Traveler",
  compact = false,
}: Props) {
  const norm = useMemo(() => normalize(graph.nodes), [graph.nodes]);
  const [segIdx, setSegIdx] = useState(-1);
  const [visitedEdgeKeys, setVisitedEdgeKeys] = useState<string[]>([]);
  const [arrived, setArrived] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathKey = path.join(",");

  // Reset when path changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisitedEdgeKeys([]);
    setArrived(false);
    if (path.length > 0) {
      setSegIdx(0);
    } else {
      setSegIdx(-1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey]);

  // Advance one segment at a time
  useEffect(() => {
    if (segIdx < 0 || segIdx >= path.length - 1) return;
    timerRef.current = setTimeout(() => {
      const fromId = path[segIdx]!;
      const toId = path[segIdx + 1]!;
      const key = `${fromId}|${toId}`;
      setVisitedEdgeKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
      const next = segIdx + 1;
      setSegIdx(next);
      if (next >= path.length - 1) setArrived(true);
    }, stepMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segIdx, stepMs]);

  const curId: string | undefined = segIdx >= 0 && segIdx < path.length ? path[segIdx] : undefined;
  const curPos: Pt = (curId && norm[curId]) ? norm[curId]! : { x: W / 2, y: H / 2 };
  const srcId = path[0];
  const dstId = path[path.length - 1];

  const isEdgeVisited = (a: string, b: string) =>
    visitedEdgeKeys.includes(`${a}|${b}`) || visitedEdgeKeys.includes(`${b}|${a}`);

  if (graph.nodes.length === 0 || path.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface ${compact ? "h-28" : "h-40"}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-dashed border-border"
        />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Run algorithm to see path</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-[#0d0d14]`}>
      {/* Label bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <AnimatePresence>
          {arrived && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-success"
            >
              ✓ Destination reached
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 3D tilted map */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          perspective: "420px",
          perspectiveOrigin: "50% 20%",
          background: "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.08), transparent 70%)",
        }}
      >
        <div
          style={{
            transform: "rotateX(50deg) scale(1.05)",
            transformOrigin: "center 85%",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className={`w-full ${compact ? "h-32" : "h-44"}`}
          >
            <defs>
              <filter id="road-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="traveler-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="ground-grad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#0d0d14" />
              </radialGradient>
            </defs>

            {/* Ground */}
            <rect x={0} y={0} width={W} height={H} fill="url(#ground-grad)" />

            {/* Grid lines (city blocks) */}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gx${i}`} x1={i * (W / 7)} y1={0} x2={i * (W / 7)} y2={H}
                stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`gy${i}`} x1={0} y1={i * (H / 5)} x2={W} y2={i * (H / 5)}
                stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
            ))}

            {/* ─── Edges: roads ─── */}
            {graph.edges.map((e) => {
              const a = norm[e.from];
              const b = norm[e.to];
              if (!a || !b) return null;
              const visited = isEdgeVisited(e.from, e.to);
              const onPath =
                path.some((id, i) => id === e.from && path[i + 1] === e.to) ||
                path.some((id, i) => id === e.to && path[i + 1] === e.from);
              return (
                <g key={e.id}>
                  {/* Road bed (shadow) */}
                  <line x1={a.x} y1={a.y + 2.5} x2={b.x} y2={b.y + 2.5}
                    stroke="#000" strokeWidth={7} strokeLinecap="round" />
                  {/* Road surface */}
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={visited ? "#22c55e" : onPath ? "#4f46e5" : "#374151"}
                    strokeWidth={visited ? 4 : onPath ? 3.5 : 3}
                    strokeLinecap="round" strokeOpacity={visited ? 1 : onPath ? 0.6 : 0.45}
                  />
                  {/* Glow on visited path */}
                  {visited && (
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="#22c55e" strokeWidth={10}
                      strokeLinecap="round" strokeOpacity={0.2}
                      filter="url(#road-glow)"
                    />
                  )}
                  {/* Center dash for road markings */}
                  {onPath && !visited && (
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="#6366f1" strokeWidth={1} strokeDasharray="4 4"
                      strokeLinecap="round" strokeOpacity={0.5}
                    />
                  )}
                  {/* Weight label */}
                  <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={7}
                    fill={visited ? "#14532d" : "#1e1b4b"} />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 3.5}
                    textAnchor="middle" fontSize={6}
                    fill={visited ? "#86efac" : "#a5b4fc"}
                    fontFamily="monospace"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* ─── Nodes: city stops ─── */}
            {graph.nodes.map((n) => {
              const p = norm[n.id];
              if (!p) return null;
              const visited = path.indexOf(n.id) <= segIdx && path.includes(n.id);
              const isCur = n.id === curId;
              const isDst = n.id === dstId;
              const isSrc = n.id === srcId;
              return (
                <g key={n.id}>
                  {/* Building shadow */}
                  <rect x={p.x - 7} y={p.y + 3} width={14} height={5} rx={2}
                    fill="rgba(0,0,0,0.5)" />
                  {/* Building body (3D block feel) */}
                  <rect x={p.x - 7} y={p.y - 6} width={14} height={9} rx={2}
                    fill={isSrc ? "#312e81" : isDst ? "#14532d" : visited ? "#1e3a5f" : "#1f2937"}
                    stroke={isDst ? "#22c55e" : isSrc ? "#818cf8" : visited ? "#3b82f6" : "#374151"}
                    strokeWidth={1}
                  />
                  {/* Node top face */}
                  <ellipse cx={p.x} cy={p.y - 6} rx={7} ry={2.5}
                    fill={isSrc ? "#4f46e5" : isDst ? "#22c55e" : visited ? "#3b82f6" : "#374151"}
                  />
                  {/* Label */}
                  <text x={p.x} y={p.y - 12}
                    textAnchor="middle" fontSize={7}
                    fill={isDst ? "#86efac" : isSrc ? "#a5b4fc" : visited ? "#93c5fd" : "#9ca3af"}
                    fontFamily="monospace" fontWeight="600"
                  >
                    {n.label}
                  </text>
                  {/* Destination star */}
                  {isDst && <StarIcon cx={p.x} cy={p.y - 19} r={5} />}
                </g>
              );
            })}

            {/* ─── Traveler ─── */}
            {curId && norm[curId] && (
              <>
                {/* Shadow on ground */}
                <motion.ellipse
                  rx={10} ry={4}
                  fill="rgba(0,0,0,0.5)"
                  animate={{ cx: curPos.x, cy: curPos.y + 10 }}
                  transition={{ duration: stepMs / 1000 * 0.75, ease: "easeInOut" }}
                />
                {/* Pulse rings */}
                {[0, 0.4, 0.8].map((delay) => (
                  <motion.circle
                    key={delay}
                    r={18}
                    fill={arrived ? "#22c55e" : "#f59e0b"}
                    opacity={0}
                    animate={{
                      cx: curPos.x,
                      cy: curPos.y,
                      opacity: [0, 0.25, 0],
                      r: [12, 26, 12],
                    }}
                    transition={{
                      cx: { duration: stepMs / 1000 * 0.75, ease: "easeInOut" },
                      cy: { duration: stepMs / 1000 * 0.75, ease: "easeInOut" },
                      opacity: { duration: 1.2, repeat: Infinity, delay },
                      r: { duration: 1.2, repeat: Infinity, delay },
                    }}
                  />
                ))}
                {/* Traveler body (glowing orb) */}
                <motion.circle
                  r={11}
                  fill={arrived ? "#22c55e" : "#f59e0b"}
                  stroke="white" strokeWidth={1.5}
                  animate={{ cx: curPos.x, cy: curPos.y }}
                  transition={{ duration: stepMs / 1000 * 0.75, ease: "easeInOut" }}
                  filter="url(#traveler-glow)"
                />
                {/* Person figure inside traveler */}
                <motion.g
                  animate={{ x: curPos.x - 0, y: curPos.y - 0 }}
                  transition={{ duration: stepMs / 1000 * 0.75, ease: "easeInOut" }}
                >
                  <PersonIcon cx={curPos.x} cy={curPos.y} />
                </motion.g>
              </>
            )}
          </svg>
        </div>

        {/* Ground reflection strip */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#0d0d14] to-transparent" />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {srcId && (
            <span className="text-indigo-400">{graph.nodes.find((n) => n.id === srcId)?.label ?? srcId}</span>
          )}
          {path.length > 1 && (
            <>
              <span className="text-muted-foreground">→</span>
              {curId && curId !== srcId && curId !== dstId && (
                <>
                  <motion.span
                    key={curId}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-amber-400"
                  >
                    {graph.nodes.find((n) => n.id === curId)?.label ?? curId}
                  </motion.span>
                  <span className="text-muted-foreground">→</span>
                </>
              )}
              <span className="text-green-400">
                ★ {graph.nodes.find((n) => n.id === dstId)?.label ?? dstId}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> src
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-amber-400" /> traveler
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-green-400" /> dst
        </div>
      </div>
    </div>
  );
}
