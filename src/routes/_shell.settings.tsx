import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Smart Route Optimization" },
      {
        name: "description",
        content:
          "Configure theme, animation and algorithm speed, graph appearance, notifications and accessibility preferences.",
      },
      { property: "og:title", content: "Settings | Smart Route Optimization" },
      { property: "og:description", content: "Preferences for theme, animation, graphs and accessibility." },
    ],
  }),
  component: Settings,
});

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated rounded-2xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Settings() {
  const { theme, set } = useTheme();
  const [animation, setAnimation] = useState([1.2]);
  const [algoSpeed, setAlgoSpeed] = useState([1]);
  const [graphTheme, setGraphTheme] = useState("Neon Blue");
  const [notify, setNotify] = useState({ toasts: true, sounds: false, warnings: true });
  const [a11y, setA11y] = useState({ reduceMotion: false, largeText: false, highContrast: false });

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Tune the interface, animation behaviour and data handling of the application."
        crumbs={[{ label: "Home", to: "/" }, { label: "Settings" }]}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Stagger className="grid gap-5 md:grid-cols-2">
          <StaggerItem>
            <Card title="Theme" description="Interface appearance">
              <div className="flex gap-2">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => set(t)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm capitalize transition-colors ${
                      theme === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Graph Theme" description="Node and edge palette">
              <div className="flex flex-wrap gap-2">
                {["Neon Blue", "Emerald", "Amber", "Monochrome"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGraphTheme(g)}
                    className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                      graphTheme === g ? "border-primary text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Animation Speed" description={`${animation[0]!.toFixed(1)}× transitions`}>
              <Slider value={animation} onValueChange={setAnimation} min={0.2} max={3} step={0.1} />
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Algorithm Speed" description={`${algoSpeed[0]!.toFixed(1)}× step interval`}>
              <Slider value={algoSpeed} onValueChange={setAlgoSpeed} min={0.2} max={3} step={0.1} />
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Notification Settings">
              <div className="space-y-3">
                {([
                  ["toasts", "In-app toasts"],
                  ["sounds", "Sound effects"],
                  ["warnings", "Validation warnings"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <Switch
                      checked={notify[key]}
                      onCheckedChange={(v) => setNotify((n) => ({ ...n, [key]: v }))}
                    />
                  </label>
                ))}
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Accessibility">
              <div className="space-y-3">
                {([
                  ["reduceMotion", "Reduce motion"],
                  ["largeText", "Larger text"],
                  ["highContrast", "High contrast"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <Switch
                      checked={a11y[key]}
                      onCheckedChange={(v) => setA11y((s) => ({ ...s, [key]: v }))}
                    />
                  </label>
                ))}
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Keyboard Shortcuts">
              <ul className="space-y-2 text-xs">
                {[
                  ["Space", "Play / pause visualizer"],
                  ["→ / ←", "Next / previous step"],
                  ["R", "Reset animation"],
                  ["N", "Add node (Module 2)"],
                  ["⌘ / Ctrl + E", "Export current graph"],
                ].map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-3">
                    <span className="rounded border border-border bg-surface px-2 py-0.5 font-mono">{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card title="Preferences & Data">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Export prefs", icon: Download },
                  { label: "Import prefs", icon: Upload },
                  { label: "Clear graphs", icon: Trash2 },
                  { label: "Reset app", icon: RotateCcw },
                ].map((b) => (
                  <button
                    key={b.label}
                    onClick={() => toast(b.label, { description: "Action completed" })}
                    className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs transition-colors hover:border-primary/50"
                  >
                    <b.icon className="h-3.5 w-3.5 text-primary" /> {b.label}
                  </button>
                ))}
              </div>
            </Card>
          </StaggerItem>
        </Stagger>

        <Reveal className="mt-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">About Version</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                SmartRoute v1.0.0 · build 2026.08 · DAA Capstone
              </p>
            </div>
            <button
              onClick={() => toast.success("Settings saved")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Save settings
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}