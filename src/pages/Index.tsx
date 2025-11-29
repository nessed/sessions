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
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient-breathe mb-2 animate-fade-in">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your music projects and track progress
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <NewSongInput onCreated={refresh} />
            {sortedSongs.map((song, index) => (
              <div
                key={song.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <SongCard song={song} project={getProject(song.projectId)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
