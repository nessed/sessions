import { useEffect, useMemo, useRef, useState } from "react";
import { parseTaskInput } from "@/lib/classifier";
import { createTask } from "@/lib/sessionsStore";
import { Info, Plus, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Priority, Section } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SmartTaskInputProps {
  songId: string;
  onCreated?: () => void;
}

export const SmartTaskInput = ({ songId, onCreated }: SmartTaskInputProps) => {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const priorityClass = (priority: Priority | undefined): string => {
    switch (priority) {
      case "urgent":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-blue-500";
      case "low":
        return "text-slate-400";
      default:
        return "text-foreground";
    }
  };

  const priorityFromToken = (token: string): Priority | undefined => {
    const lower = token.toLowerCase();
    if (lower.startsWith("!")) {
      const clean = lower.slice(1);
      if (clean === "low" || clean === "medium" || clean === "high" || clean === "urgent") {
        return clean as Priority;
      }
    }
    if (lower.startsWith("p") && lower.length === 2) {
      const map: Record<string, Priority> = {
        p1: "urgent",
        p2: "high",
        p3: "medium",
        p4: "low",
      };
      return map[lower];
    }
    return undefined;
  };

  const parsed = useMemo(() => parseTaskInput(value), [value]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  const highlightedValue = useMemo(() => {
    const sectionRegex =
      /@(?<section>idea|writing|recording|production|mixing|mastering|release)\b/gi;
    const priorityRegex = /!(low|medium|high|urgent)\b/gi;
    const priorityShortcutRegex = /\bp[1-4]\b/gi;
    const dueRegex = /\bdue:(today|tomorrow|\d{4}-\d{2}-\d{2})\b/gi;
    const standaloneDateRegex = /\b(today|tomorrow)\b/gi;

    let output = escapeHtml(value) || "";

    output = output.replace(
      sectionRegex,
      (match) => `<span class="text-primary font-medium">${match}</span>`
    );

    output = output.replace(dueRegex, (match) => {
      return `<span class="text-emerald-500 font-medium">${match}</span>`;
    });

    output = output.replace(standaloneDateRegex, (match) => {
      return `<span class="text-emerald-500 font-medium">${match}</span>`;
    });

    output = output.replace(priorityRegex, (match) => {
      const priority = priorityFromToken(match);
      return `<span class="${priorityClass(priority)} font-medium">${match}</span>`;
    });

    output = output.replace(priorityShortcutRegex, (match) => {
      const priority = priorityFromToken(match);
      return `<span class="${priorityClass(priority)} font-medium">${match}</span>`;
    });

    return output || "&nbsp;";
  }, [value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanTitle = parsed.title.trim();
    if (!cleanTitle) return;

    setIsSubmitting(true);

    try {
      const section: Section = parsed.section || "idea";
      createTask(songId, section, cleanTitle, parsed.priority, parsed.dueDate);
      setValue("");
      setRecentlyAdded(cleanTitle);
      setTimeout(() => setRecentlyAdded(null), 1500);
      onCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as React.FormEvent);
      return;
    }
    if (event.key === "Escape") {
      setValue("");
      textareaRef.current?.blur();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 px-1 py-1"
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg text-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 relative">
          <div
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words text-sm leading-6 text-white"
            aria-hidden
            dangerouslySetInnerHTML={{ __html: highlightedValue }}
          />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Add a task... try "@mixing !urgent due:tomorrow"'
            className="relative w-full bg-transparent border-none outline-none text-sm leading-6 resize-none text-transparent caret-primary placeholder:text-muted-foreground"
            rows={1}
          />
        </div>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="How to use smart input"
              >
                <Info className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="text-sm max-w-sm">
              <p className="font-medium mb-2">Smart input tips</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  <span className="font-semibold text-primary">@mixing</span>{" "}
                  for section
                </li>
                <li>
                  <span className="font-semibold text-orange-500">!high</span>{" "}
                  or <span className="font-semibold">p2</span> for priority
                </li>
                <li>
                  <span className="font-semibold text-emerald-600">
                    due:tomorrow
                  </span>{" "}
                  or <span className="font-semibold text-emerald-600">today</span>{" "}
                  for dates
                </li>
                <li>Enter to add, Shift+Enter for newline, Esc to clear</li>
              </ul>
            </PopoverContent>
          </Popover>
          <button
            type="submit"
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors",
              parsed.title.trim()
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground cursor-not-allowed"
            )}
            disabled={!parsed.title.trim() || isSubmitting}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          {parsed.section && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
              Section: {parsed.section}
            </span>
          )}
          {parsed.priority && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
              Priority: {parsed.priority}
            </span>
          )}
          {parsed.dueDate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600">
              Due: {parsed.dueDate}
            </span>
          )}
          {!parsed.section && !parsed.priority && !parsed.dueDate && (
            <span className="rounded-full bg-muted px-2 py-1">General task</span>
          )}
        </div>
        {recentlyAdded && (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle className="w-4 h-4" /> Added: {recentlyAdded}
          </span>
        )}
      </div>
    </form>
  );
};
