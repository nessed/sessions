import { Link } from "react-router-dom";
import { Song, Project } from "@/lib/types";
import { getSongProgress } from "@/lib/sessionsStore";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { formatDistanceToNow } from "date-fns";
import { Music } from "lucide-react";

interface SongCardProps {
  song: Song;
  project?: Project;
}

export const SongCard = ({ song, project }: SongCardProps) => {
  const progress = getSongProgress(song.id);

  return (
    <Link
      to={`/song/${song.id}`}
      className="song-card block animate-fade-in aurora-glow"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 via-aura-lavender/20 to-aura-peach/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {song.coverArt ? (
            <img
              src={song.coverArt}
              alt={`${song.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-6 h-6 text-primary relative z-10" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg truncate">
            {song.title}
          </h3>
          {project && (
            <p className="text-sm text-muted-foreground truncate">
              {project.title}
            </p>
          )}
        </div>
        <StatusBadge status={song.status} />
      </div>

      <div className="mt-4">
        <ProgressBar progress={progress} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {song.bpm && <span>{song.bpm} BPM</span>}
          {song.key && <span>• Key: {song.key}</span>}
        </div>
        <span>
          {formatDistanceToNow(new Date(song.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {song.moodTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {song.moodTags.slice(0, 3).map((tag, index) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-primary/10 via-aura-lavender/10 to-aura-teal/10 text-muted-foreground border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {tag}
            </span>
          ))}
          {song.moodTags.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-primary/10 via-aura-lavender/10 to-aura-teal/10 text-muted-foreground border border-primary/20">
              +{song.moodTags.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
