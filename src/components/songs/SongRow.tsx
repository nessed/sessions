import { Link } from "react-router-dom";
import { Song, Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { Music } from "lucide-react";

interface SongRowProps {
  song: Song;
  project?: Project;
  style?: React.CSSProperties;
}

export const SongRow = ({ song, project, style }: SongRowProps) => {
  const statusDotColors: Record<string, string> = {
    idea: "bg-aura-lavender",
    writing: "bg-primary",
    recording: "bg-aura-peach",
    production: "bg-aura-teal",
    mixing: "bg-blue-400",
    mastering: "bg-amber-400",
    release: "bg-emerald-400",
  };

  return (
    <Link
      to={`/song/${song.id}`}
      style={style}
      className="grid grid-cols-[32px,1fr,120px,160px,140px] items-center px-2 py-2 text-sm text-white hover:bg-white/5 border-b border-white/5"
    >
      <div className="w-8 h-8 rounded-sm overflow-hidden bg-zinc-900 flex items-center justify-center">
        {song.coverArt ? (
          <img
            src={song.coverArt}
            alt={`${song.title} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music className="w-4 h-4 text-zinc-500" />
        )}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {song.title}
        </div>
        {project && (
          <div className="text-[11px] text-zinc-500 uppercase tracking-[0.08em]">
            {project.title}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${statusDotColors[song.status]} shadow`}
        />
        <StatusBadge status={song.status} variant="minimal" className="text-zinc-400" />
      </div>

      <div className="text-xs text-zinc-500 font-mono">
        {song.bpm ? `${song.bpm} bpm` : "—"}
        {song.key ? ` / ${song.key}` : ""}
      </div>

      <div className="text-xs text-zinc-600 font-mono">
        {formatDistanceToNow(new Date(song.updatedAt), { addSuffix: true })}
      </div>
    </Link>
  );
};
