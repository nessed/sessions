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
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your music projects and track progress
          </p>
        </header>

        {sortedSongs.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-aura-peach/20 flex items-center justify-center mx-auto mb-6">
              <Music className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">
              No songs yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start your creative journey by adding your first song. Track ideas, tasks, and progress all in one place.
            </p>
            <NewSongInput onCreated={refresh} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <NewSongInput onCreated={refresh} />
            {sortedSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                project={getProject(song.projectId)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
