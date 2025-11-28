import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Music, 
  Disc, 
  Lightbulb, 
  Calendar,
  Pen,
  Mic,
  Sliders,
  Headphones,
  Sparkles,
  Rocket,
  Moon,
  Sun,
  Settings,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/hooks/useSessionsDB";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/songs", icon: Music, label: "All Songs" },
  { to: "/projects", icon: Disc, label: "EPs / Albums" },
  { to: "/ideas", icon: Lightbulb, label: "Ideas Vault" },
  { to: "/today", icon: Calendar, label: "Today" },
];

const filterItems = [
  { to: "/filter/writing", icon: Pen, label: "Writing" },
  { to: "/filter/recording", icon: Mic, label: "Recording" },
  { to: "/filter/production", icon: Sliders, label: "Production" },
  { to: "/filter/mixing", icon: Headphones, label: "Mixing" },
  { to: "/filter/mastering", icon: Sparkles, label: "Mastering" },
  { to: "/filter/release", icon: Rocket, label: "Release" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { settings, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        cn("nav-item", isActive && "active")
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-panel-subtle"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          <h1 className="text-2xl font-display font-bold text-gradient">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">Music Project Manager</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>

          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Filters
            </p>
          </div>
          <div className="space-y-1">
            {filterItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={toggleTheme}
            className="nav-item w-full"
          >
            {settings.theme === "dark" ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <NavLink to="/settings" onClick={() => setIsOpen(false)} className={({ isActive }) => cn("nav-item", isActive && "active")}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
