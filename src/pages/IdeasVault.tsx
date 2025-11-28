import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/songs/SongCard";
import { NewSongInput } from "@/components/songs/NewSongInput";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { Lightbulb } from "lucide-react";

const IdeasVault = () => {
  const { db, refresh } = useSessionsDB();

  const ideas = db.songs
    .filter((song) => song.status === "idea")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getProject = (projectId?: string) => {
    if (!projectId) return undefined;
    return db.projects.find((p) => p.id === projectId);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Ideas Vault</h1>
          <p className="text-muted-foreground">Capture and develop your musical ideas</p>
        </header>

        {ideas.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-status-idea/20 to-aura-lavender/20 flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-10 h-10 text-status-idea" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">No ideas yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start capturing your musical inspirations. Every great song begins with a simple idea.
            </p>
            <NewSongInput onCreated={refresh} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <NewSongInput onCreated={refresh} />
            {ideas.map((song) => (
              <SongCard key={song.id} song={song} project={getProject(song.projectId)} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IdeasVault;
