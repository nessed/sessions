import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/hooks/useSessionsDB";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { SearchBar } from "@/components/search/SearchBar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { settings } = useTheme();
  const { saved } = useSessionsDB();

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main
        className={cn(
          "flex-1 min-h-screen transition-colors duration-500",
          settings.aurasEnabled && "aura-background"
        )}
      >
        <div className="p-4 lg:p-8">
          <div className="mb-6 flex justify-end">
            <SearchBar />
          </div>
          {children}
        </div>

        {/* Save indicator */}
        <div
          className={cn(
            "fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full glass-panel-subtle text-sm transition-all duration-200 backdrop-blur-xl",
            saved
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-95 pointer-events-none"
          )}
        >
          <Check className="w-4 h-4 text-status-release" />
          <span className="text-muted-foreground font-medium">Saved</span>
        </div>
      </main>
    </div>
  );
};
