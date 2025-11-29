import { useState } from "react";
import { detectCategory, stripTags } from "@/lib/classifier";
import { createTask } from "@/lib/sessionsStore";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartTaskInputProps {
  songId: string;
  onCreated?: () => void;
}

export const SmartTaskInput = ({ songId, onCreated }: SmartTaskInputProps) => {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const category = detectCategory(value);
    const cleanTitle = stripTags(value).trim() || "New task";

    createTask(songId, category, cleanTitle);
    setValue("");
    setIsSubmitting(false);
    onCreated?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/60 border border-border"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Sparkles className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Add a task... e.g. "EQ vocals" or "@mixing balance levels"'
        className="flex-1 bg-transparent border-none outline-none text-sm"
      />
      <button
        type="submit"
        className={cn(
          "px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors",
          value.trim()
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
        disabled={!value.trim() || isSubmitting}
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </form>
  );
};
