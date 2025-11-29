import { Priority, PRIORITY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

interface PrioritySelectorProps {
  value?: Priority;
  onChange: (priority: Priority | undefined) => void;
  className?: string;
}

const priorityColors: Record<Priority, string> = {
  low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  urgent: "text-red-500 bg-red-500/10 border-red-500/20",
};

export const PrioritySelector = ({
  value,
  onChange,
  className,
}: PrioritySelectorProps) => {
  const priorities: (Priority | undefined)[] = [
    undefined,
    "low",
    "medium",
    "high",
    "urgent",
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {priorities.map((priority) => (
        <button
          key={priority || "none"}
          onClick={() => onChange(priority)}
          className={cn(
            "px-2 py-1 rounded-md text-xs font-medium transition-all border",
            priority
              ? priorityColors[priority]
              : "text-muted-foreground bg-muted/50 border-border hover:bg-muted",
            value === priority && "ring-2 ring-primary"
          )}
          title={priority ? PRIORITY_LABELS[priority] : "No Priority"}
        >
          <Flag className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
};
