import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number; phase: number };

/** Animated graph network rendered on canvas: drifting nodes + pulsing edges. */
export function GraphNetwork({
  className = "",
  density = 34,
  linkDistance = 190,
}: {
  className?: string;
  density?: number;
  linkDistance?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const read = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    let accent = read("--primary") || "oklch(0.66 0.18 256)";
    let glow = read("--primary-glow") || accent;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(12, Math.round((density * w) / 1200));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.6 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
      }));
      accent = read("--primary") || accent;
      glow = read("--primary-glow") || glow;
    };

    const tint = (color: string, alpha: number) =>
      `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`;

    let t = 0;
    const frame = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > linkDistance) continue;
          const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2 + (i + j) * 0.6));
          ctx.strokeStyle = tint(glow, (1 - d / linkDistance) * 0.32 * pulse);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 2.4 + n.phase);
        ctx.fillStyle = tint(accent, 0.9);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = tint(glow, 0.14 * pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density, linkDistance]);

  return <canvas ref={ref} aria-hidden className={`h-full w-full ${className}`} />;
}