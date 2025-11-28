import { SongStatus, SECTION_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: SongStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn("status-badge", `status-${status}`, className)}>
      {SECTION_LABELS[status]}
    </span>
  );
};
