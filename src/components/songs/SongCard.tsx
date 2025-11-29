import { Link } from "react-router-dom";
import { Song, Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Music } from "lucide-react";

interface SongCardProps {
  song: Song;
  project?: Project;
  style?: React.CSSProperties;
}

export const SongCard = ({ song, project, style }: SongCardProps) => {
  const bpmText = song.bpm ? `${song.bpm} bpm` : "—";
  const keyText = song.key ? ` / ${song.key}` : "";

  return (
    <Link
      to={`/song/${song.id}`}
      style={style}
      className="flex items-center justify-between py-3 px-2 text-white hover:text-white transition-all duration-150 hover:translate-x-2 border-b border-white/5 bg-transparent hover:bg-white/5"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-sm overflow-hidden bg-transparent flex-shrink-0">
          {song.coverArt ? (
            <img
              src={song.coverArt}
              alt={`${song.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 flex items-center justify-center">
              <Music className="w-4 h-4 text-white/50" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-light tracking-tight leading-tight truncate">
            {song.title}
          </span>
          {project && (
            <span className="text-[11px] text-white/50 uppercase tracking-[0.08em]">
              {project.title}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-white/50 text-xs font-mono">
        <span>
          {bpmText}
          {keyText}
        </span>
        <StatusBadge status={song.status} variant="minimal" className="text-white/50" />
      </div>
    </Link>
  );
};
