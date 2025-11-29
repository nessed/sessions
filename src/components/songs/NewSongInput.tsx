import { useState } from "react";
import { Plus } from "lucide-react";

interface NewSongInputProps {
  projectId?: string;
  onCreated?: (title: string) => Promise<boolean | void> | boolean | void;
}

export const NewSongInput = ({ projectId, onCreated }: NewSongInputProps) => {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const result = await onCreated?.(title.trim());
    if (result === false) return;
    setTitle("");
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="song-card flex items-center gap-3 text-muted-foreground hover:text-foreground w-full group"
      >
        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-primary/30 group-hover:border-primary/60 flex items-center justify-center relative overflow-hidden transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-aura-lavender/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Plus className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <span className="font-medium group-hover:text-primary transition-colors duration-300">
          New Song
        </span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="song-card animate-scale-in aurora-glow"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-aura-lavender/15 to-aura-peach/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <Plus className="w-5 h-5 text-primary relative z-10" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title..."
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-lg font-display font-semibold placeholder:text-muted-foreground/50"
          onBlur={() => {
            if (!title.trim()) setIsExpanded(false);
          }}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setIsExpanded(false);
          }}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 text-sm bg-gradient-to-r from-primary via-aura-lavender to-primary text-primary-foreground rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
        >
          <span className="relative z-10 font-medium">Create Song</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-aura-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </form>
  );
};
