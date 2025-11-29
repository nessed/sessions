import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
  showClear?: boolean;
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  showClear = true,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value || undefined);
  };

  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return format(date, "MMM d, yyyy");
    return format(date, "MMM d, yyyy");
  };

  const dateValue = value ? new Date(value).toISOString().split("T")[0] : "";

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          className="flex-1 bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder={placeholder}
        />
        {value && showClear && (
          <button
            onClick={() => onChange(undefined)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && (
        <div
          className={cn(
            "mt-1 text-xs",
            isPast(new Date(value)) && !isToday(new Date(value))
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {formatDateDisplay(value)}
          {isPast(new Date(value)) && !isToday(new Date(value)) && " (Overdue)"}
        </div>
      )}
    </div>
  );
};
