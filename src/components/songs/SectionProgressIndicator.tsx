import { Section, SECTIONS, SECTION_LABELS } from "@/lib/types";
import { getSectionProgress } from "@/lib/sessionsStore";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProgressIndicatorProps {
  songId: string;
  className?: string;
}

export const SectionProgressIndicator = ({
  songId,
  className,
}: SectionProgressIndicatorProps) => {
  const sections = SECTIONS.map((section) => ({
    section,
    label: SECTION_LABELS[section],
    ...getSectionProgress(songId, section),
  }));

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Section Progress
      </h3>
      <div className="space-y-2">
        {sections.map(
          ({
            section,
            label,
            progress,
            isComplete,
            totalTasks,
            completedTasks,
          }) => (
            <div
              key={section}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                isComplete && "bg-status-release/10"
              )}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isComplete ? (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-status-release to-status-release/80 flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : totalTasks > 0 ? (
                  <div className="w-6 h-6 rounded-full border-2 border-status-release/30 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-status-release/20 transition-all duration-300"
                      style={{ height: `${progress}%` }}
                    />
                    <span className="relative text-[10px] font-bold text-status-release z-10">
                      {progress}%
                    </span>
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isComplete && "text-status-release"
                    )}
                  >
                    {label}
                  </span>
                  {totalTasks > 0 && (
                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        isComplete && "text-status-release"
                      )}
                    >
                      {completedTasks}/{totalTasks}
                    </span>
                  )}
                </div>
                {totalTasks > 0 && !isComplete && (
                  <div className="mt-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-aura-teal rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
