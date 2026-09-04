import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Menu, Moon, Route as RouteIcon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

const links = [
  { label: "Home", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Modules", to: "/module-1" },
  { label: "Documentation", to: "/documentation" },
  { label: "About", to: "/about" },
] as const;

export function SiteNav() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <motion.span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface"
            animate={{ rotate: [0, 8, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <RouteIcon className="h-4.5 w-4.5 text-primary" />
          </motion.span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold">SmartRoute</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Graph Algorithm Suite
            </span>
          </span>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/dashboard"
            className="group relative hidden overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground sm:inline-flex"
            style={{ background: "var(--gradient-primary)" }}
          >
            <span className="relative z-10">Launch Project</span>
            <span className="absolute inset-0 translate-y-full bg-foreground/10 transition-transform duration-300 group-hover:translate-y-0" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass overflow-hidden border-t border-border lg:hidden"
        >
          <div className="flex flex-col p-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}