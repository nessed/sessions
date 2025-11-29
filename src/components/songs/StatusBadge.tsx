import { SongStatus, SECTION_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: SongStatus;
  className?: string;
  variant?: "default" | "minimal";
}

export const StatusBadge = ({
  status,
  className,
  variant = "default",
}: StatusBadgeProps) => {
  if (variant === "minimal") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase font-semibold",
          className
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.4)]",
            status === "idea" && "bg-aura-lavender",
            status === "writing" && "bg-primary",
            status === "recording" && "bg-aura-peach",
            status === "production" && "bg-aura-teal",
            status === "mixing" && "bg-blue-400",
            status === "mastering" && "bg-amber-400",
            status === "release" && "bg-emerald-400"
          )}
        />
        <span className="text-foreground">{SECTION_LABELS[status]}</span>
      </span>
    );
  }

  return (
    <span className={cn("status-badge", `status-${status}`, className)}>
      {SECTION_LABELS[status]}
    </span>
  );
};
