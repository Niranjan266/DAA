import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Moon, Sun, Github } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { useTheme } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const { theme, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-0 z-40 grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-3 sm:px-5">
            <SidebarTrigger />
            <Link to="/" className="min-w-0 truncate text-sm font-medium">
              Smart Route Optimization
              <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                Graph Algorithm Suite
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hidden h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground sm:grid"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}