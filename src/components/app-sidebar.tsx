import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  Network,
  Route as RouteIcon,
  Settings,
  Waypoints,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const main = [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }];

const modules = [
  { title: "Module 1 · Requirements", url: "/module-1", icon: BookOpen },
  { title: "Module 2 · Graph Builder", url: "/module-2", icon: Network },
  { title: "Module 3 · Shortest Path", url: "/module-3", icon: Waypoints },
  { title: "Module 4 · Optimization", url: "/module-4", icon: BarChart3 },
  { title: "Module 5 · Testing", url: "/module-5", icon: FlaskConical },
];

const system = [
  { title: "Documentation", url: "/documentation", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const render = (items: typeof modules) => (
    <SidebarMenu>
      {items.map((item) => {
        const active = pathname === item.url;
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
              <Link to={item.url} className="group flex items-center gap-2">
                <motion.span whileHover={{ scale: 1.18, rotate: 4 }} className="shrink-0">
                  <item.icon className="h-4 w-4" />
                </motion.span>
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex min-w-0 items-center gap-2.5 px-1 py-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent">
            <RouteIcon className="h-4 w-4 text-primary" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-semibold">SmartRoute</span>
              <span className="block truncate text-[10px] text-muted-foreground">
                DAA Capstone Suite
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>{render(main)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>{render(modules)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>{render(system)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <p className="px-2 py-1 font-mono text-[10px] text-muted-foreground">v1.0.0 · stable</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}