export type GraphNode = { id: string; label: string; x: number; y: number };
export type GraphEdge = { id: string; from: string; to: string; weight: number };
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[]; directed: boolean };

export const uid = () => Math.random().toString(36).slice(2, 9);

export function neighbors(g: Graph, id: string) {
  const out: { to: string; weight: number; edgeId: string }[] = [];
  for (const e of g.edges) {
    if (e.from === id) out.push({ to: e.to, weight: e.weight, edgeId: e.id });
    else if (!g.directed && e.to === id) out.push({ to: e.from, weight: e.weight, edgeId: e.id });
  }
  return out;
}

export function degreeStats(g: Graph) {
  const n = g.nodes.length;
  const m = g.edges.length;
  const avgDegree = n === 0 ? 0 : (g.directed ? m : 2 * m) / n;
  const maxEdges = g.directed ? n * (n - 1) : (n * (n - 1)) / 2;
  const density = maxEdges === 0 ? 0 : m / maxEdges;
  return { n, m, avgDegree, density };
}

export function components(g: Graph) {
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (const node of g.nodes) {
    if (seen.has(node.id)) continue;
    const stack = [node.id];
    const group: string[] = [];
    seen.add(node.id);
    while (stack.length) {
      const cur = stack.pop()!;
      group.push(cur);
      for (const nb of neighbors({ ...g, directed: false }, cur)) {
        if (!seen.has(nb.to)) {
          seen.add(nb.to);
          stack.push(nb.to);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

export type DijkstraStep = {
  current: string | null;
  visited: string[];
  queue: { id: string; dist: number }[];
  dist: Record<string, number>;
  prev: Record<string, string | null>;
  activeEdge: string | null;
  line: number;
  note: string;
};

export function dijkstraSteps(g: Graph, source: string, target: string): DijkstraStep[] {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const n of g.nodes) {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  }
  dist[source] = 0;
  const visited: string[] = [];
  let queue = g.nodes.map((n) => ({ id: n.id, dist: dist[n.id]! }));
  const steps: DijkstraStep[] = [];

  const snap = (current: string | null, activeEdge: string | null, line: number, note: string) =>
    steps.push({
      current,
      visited: [...visited],
      queue: [...queue].sort((a, b) => a.dist - b.dist),
      dist: { ...dist },
      prev: { ...prev },
      activeEdge,
      line,
      note,
    });

  snap(null, null, 1, `Initialize distances, dist[${source}] = 0`);

  while (queue.length) {
    queue.sort((a, b) => a.dist - b.dist);
    const u = queue.shift()!;
    if (u.dist === Infinity) {
      snap(null, null, 4, "Remaining nodes unreachable — stopping");
      break;
    }
    visited.push(u.id);
    const label = g.nodes.find((n) => n.id === u.id)?.label ?? u.id;
    snap(u.id, null, 4, `Extract-min → ${label} (dist ${u.dist})`);

    for (const nb of neighbors(g, u.id)) {
      if (visited.includes(nb.to)) continue;
      const candidate = dist[u.id]! + nb.weight;
      const better = candidate < dist[nb.to]!;
      if (better) {
        dist[nb.to] = candidate;
        prev[nb.to] = u.id;
        queue = queue.map((q) => (q.id === nb.to ? { ...q, dist: candidate } : q));
      }
      const nbLabel = g.nodes.find((n) => n.id === nb.to)?.label ?? nb.to;
      snap(
        u.id,
        nb.edgeId,
        better ? 8 : 7,
        better ? `Relax edge → ${nbLabel} improved to ${candidate}` : `Edge → ${nbLabel} not improved`,
      );
    }
    if (u.id === target) {
      snap(u.id, null, 10, "Target finalized — shortest path found");
      break;
    }
  }
  snap(null, null, 11, "Algorithm complete");
  return steps;
}

export function reconstructPath(prev: Record<string, string | null>, source: string, target: string) {
  const path: string[] = [];
  let cur: string | null = target;
  while (cur) {
    path.unshift(cur);
    if (cur === source) return path;
    cur = prev[cur] ?? null;
  }
  return [];
}

export function floydWarshall(g: Graph) {
  const ids = g.nodes.map((n) => n.id);
  const idx = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;
  const d: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  );
  const next: (string | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  for (const e of g.edges) {
    const i = idx.get(e.from);
    const j = idx.get(e.to);
    if (i === undefined || j === undefined) continue;
    d[i]![j] = Math.min(d[i]![j]!, e.weight);
    next[i]![j] = e.to;
    if (!g.directed) {
      d[j]![i] = Math.min(d[j]![i]!, e.weight);
      next[j]![i] = e.from;
    }
  }
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (d[i]![k]! + d[k]![j]! < d[i]![j]!) {
          d[i]![j] = d[i]![k]! + d[k]![j]!;
          next[i]![j] = next[i]![k]!;
        }
      }
    }
  }
  return { ids, dist: d, next };
}

export function fwPath(
  fw: ReturnType<typeof floydWarshall>,
  source: string,
  target: string,
): string[] {
  const pos = new Map(fw.ids.map((id, i) => [id, i]));
  const i = pos.get(source);
  const j = pos.get(target);
  if (i === undefined || j === undefined || fw.next[i]![j] === null) return [];
  const path = [source];
  let cur = source;
  let guard = 0;
  while (cur !== target && guard++ < 200) {
    const ci = pos.get(cur)!;
    const nxt = fw.next[ci]![j];
    if (!nxt) return [];
    path.push(nxt);
    cur = nxt;
  }
  return path;
}

// ─── Sample Graphs ────────────────────────────────────────────────────────────

/** Default 8-node city network used across modules */
export function sampleGraph(): Graph {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const positions: [number, number][] = [
    [140, 120],
    [330, 80],
    [520, 140],
    [700, 100],
    [180, 320],
    [380, 300],
    [580, 340],
    [760, 290],
  ];
  const nodes: GraphNode[] = labels.map((label, i) => ({
    id: label,
    label,
    x: positions[i]![0],
    y: positions[i]![1],
  }));
  const raw: [string, string, number][] = [
    ["A", "B", 4],
    ["A", "E", 6],
    ["B", "C", 3],
    ["B", "F", 5],
    ["C", "D", 4],
    ["C", "G", 6],
    ["D", "H", 3],
    ["E", "F", 4],
    ["F", "G", 3],
    ["G", "H", 5],
    ["E", "G", 9],
    ["B", "E", 7],
  ];
  return {
    directed: false,
    nodes,
    edges: raw.map(([from, to, weight]) => ({ id: `${from}-${to}`, from, to, weight })),
  };
}

/** Small 5-node graph — great for beginner demonstrations */
export function sampleGraphSmall(): Graph {
  const labels = ["S", "A", "B", "C", "T"];
  const positions: [number, number][] = [
    [120, 215],
    [300, 100],
    [300, 330],
    [520, 215],
    [700, 215],
  ];
  const nodes: GraphNode[] = labels.map((label, i) => ({
    id: label,
    label,
    x: positions[i]![0],
    y: positions[i]![1],
  }));
  const raw: [string, string, number][] = [
    ["S", "A", 3],
    ["S", "B", 5],
    ["A", "C", 2],
    ["B", "C", 4],
    ["A", "B", 1],
    ["C", "T", 3],
  ];
  return {
    directed: false,
    nodes,
    edges: raw.map(([from, to, weight]) => ({ id: `${from}-${to}`, from, to, weight })),
  };
}

/** Dense 10-node network for stress testing */
export function sampleGraphDense(): Graph {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const cx = 450, cy = 215, r = 180;
  const nodes: GraphNode[] = labels.map((label, i) => {
    const angle = (i / labels.length) * 2 * Math.PI - Math.PI / 2;
    return { id: label, label, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const raw: [string, string, number][] = [
    ["A", "B", 2], ["A", "C", 7], ["B", "C", 3], ["B", "D", 5],
    ["C", "E", 4], ["C", "F", 6], ["D", "E", 2], ["D", "G", 8],
    ["E", "F", 1], ["E", "H", 5], ["F", "G", 3], ["F", "I", 4],
    ["G", "H", 2], ["G", "J", 6], ["H", "I", 3], ["I", "J", 2],
    ["A", "F", 9], ["B", "G", 7], ["C", "H", 5], ["D", "I", 4],
  ];
  return {
    directed: false,
    nodes,
    edges: raw.map(([from, to, weight]) => ({ id: `${from}-${to}`, from, to, weight })),
  };
}

/** Network topology 6-node graph */
export function sampleGraphNetwork(): Graph {
  const labels = ["Router", "Switch1", "Switch2", "PC1", "PC2", "Server"];
  const shortLabels = ["R", "S1", "S2", "P1", "P2", "Sv"];
  const positions: [number, number][] = [
    [450, 120],
    [250, 260],
    [650, 260],
    [120, 380],
    [380, 380],
    [650, 380],
  ];
  const nodes: GraphNode[] = labels.map((label, i) => ({
    id: shortLabels[i]!,
    label: shortLabels[i]!,
    x: positions[i]![0],
    y: positions[i]![1],
  }));
  const raw: [string, string, number][] = [
    ["R", "S1", 1], ["R", "S2", 1],
    ["S1", "PC1", 2], ["S1", "PC2", 3], ["S1", "S2", 4],
    ["S2", "Sv", 2], ["S2", "PC2", 3],
  ];
  return {
    directed: false,
    nodes,
    edges: raw.map(([from, to, weight]) => ({ id: `${from}-${to}`, from, to, weight })),
  };
}

// ─── Text Parser ──────────────────────────────────────────────────────────────

/**
 * Parse a compact edge-list string into a Graph.
 * Formats supported:
 *   "A-B:4, B-C:3, C-D:2"         (undirected, weight after colon)
 *   "A->B:4, B->C:3"               (directed)
 *   "A B 4\nB C 3"                 (space/newline separated)
 */
export function parseGraphText(input: string, directed = false): Graph | null {
  try {
    const tokens = input
      .replace(/\r\n/g, "\n")
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (tokens.length === 0) return null;

    const nodeMap = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    const getOrCreate = (label: string) => {
      if (!nodeMap.has(label)) {
        const k = nodeMap.size;
        const cols = 4;
        nodeMap.set(label, {
          id: label,
          label,
          x: 120 + (k % cols) * 200,
          y: 100 + Math.floor(k / cols) * 160,
        });
      }
      return nodeMap.get(label)!;
    };

    for (const token of tokens) {
      // Match: A->B:5 | A-B:5 | A B 5
      const m =
        token.match(/^([A-Za-z0-9_]+)\s*-+>?\s*([A-Za-z0-9_]+)\s*:?\s*(\d+(?:\.\d+)?)$/) ??
        token.match(/^([A-Za-z0-9_]+)\s+([A-Za-z0-9_]+)\s+(\d+(?:\.\d+)?)$/);
      if (!m) continue;
      const [, from, to, w] = m;
      if (!from || !to || !w) continue;
      getOrCreate(from);
      getOrCreate(to);
      const isDir = token.includes("->");
      edges.push({ id: `${from}-${to}-${uid()}`, from, to, weight: parseFloat(w) });
      if (isDir && !directed) directed = true;
    }

    if (nodeMap.size === 0) return null;

    // Auto-layout in a nice arc if few nodes
    const nodes = [...nodeMap.values()];
    if (nodes.length <= 10) {
      const cx = 450, cy = 215, r = Math.min(170, 50 * nodes.length);
      nodes.forEach((n, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
        n.x = cx + r * Math.cos(angle);
        n.y = cy + r * Math.sin(angle);
      });
    }

    return { nodes, edges, directed };
  } catch {
    return null;
  }
}