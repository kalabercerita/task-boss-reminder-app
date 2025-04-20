
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckSquare,
  Bell,
  Settings,
  Home
} from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 shrink-0 border-r bg-sidebar h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">TaskBoss</h2>
        <p className="text-sm text-muted-foreground">Task & reminder management</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-sidebar-foreground hover:text-sidebar-foreground"
            )
          }
        >
          <Home className="h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-sidebar-foreground hover:text-sidebar-foreground"
            )
          }
        >
          <CheckSquare className="h-5 w-5" />
          Tasks
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-sidebar-foreground hover:text-sidebar-foreground"
            )
          }
        >
          <Calendar className="h-5 w-5" />
          Calendar
        </NavLink>
        <NavLink
          to="/reminders"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-sidebar-foreground hover:text-sidebar-foreground"
            )
          }
        >
          <Bell className="h-5 w-5" />
          Reminders
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-sidebar-foreground hover:text-sidebar-foreground"
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          TaskBoss v1.0.0
        </div>
      </div>
    </div>
  );
}
