import { useState } from "react";
import { Plus } from "lucide-react";
import { createSong } from "@/lib/sessionsStore";

interface NewSongInputProps {
  projectId?: string;
  onCreated?: () => void;
}

export const NewSongInput = ({ projectId, onCreated }: NewSongInputProps) => {
  const [title, setTitle] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    createSong(title.trim(), projectId);
    setTitle("");
    setIsExpanded(false);
    onCreated?.();
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="song-card flex items-center gap-3 text-muted-foreground hover:text-foreground w-full"
      >
        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <span className="font-medium">New Song</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="song-card animate-scale-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Plus className="w-5 h-5 text-primary" />
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
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Create Song
        </button>
      </div>
    </form>
  );
};
