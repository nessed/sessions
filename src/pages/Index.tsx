import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/songs/SongCard";
import { NewSongInput } from "@/components/songs/NewSongInput";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { Music } from "lucide-react";

const Index = () => {
  const { db, refresh } = useSessionsDB();

  const sortedSongs = [...db.songs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const getProject = (projectId?: string) => {
    if (!projectId) return undefined;
    return db.projects.find((p) => p.id === projectId);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 pt-6 lg:pt-0">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Overview</p>
          <h1 className="text-3xl font-display font-semibold text-white mb-2">Dashboard</h1>
          <p className="text-sm text-zinc-300">Your songs, ordered by momentum.</p>
        </header>

        {sortedSongs.length === 0 ? (
          <div className="glass-panel p-12 text-center aurora-glow animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 via-aura-lavender/20 to-aura-peach/30 flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
              <Music className="w-10 h-10 text-primary relative z-10" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">
              No songs yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start your creative journey by adding your first song. Track
              ideas, tasks, and progress all in one place.
            </p>
            <NewSongInput onCreated={refresh} />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">
                Songs
              </div>
              <NewSongInput onCreated={refresh} />
            </div>
            <div className="flex flex-col">
              {sortedSongs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  project={getProject(song.projectId)}
                  style={{ animationDelay: `${index * 0.02}s` } as any}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
