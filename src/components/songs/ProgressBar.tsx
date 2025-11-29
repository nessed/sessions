import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar = ({
  progress,
  className,
  showLabel = true,
}: ProgressBarProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-primary via-aura-lavender to-aura-teal rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground min-w-[3ch]">
          {progress}%
        </span>
      )}
    </div>
  );
};
