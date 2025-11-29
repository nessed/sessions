import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SongCard } from "@/components/songs/SongCard";
import { NewSongInput } from "@/components/songs/NewSongInput";
import { Music } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { createSong, deleteSong, getSongs, updateSong } from "@/lib/supabaseStore";
import { Song } from "@/lib/types";

const Index = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getSongs(user.id);
        setSongs(data);
      } catch (error) {
        console.error("Failed to load songs on dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const sortedSongs = useMemo(
    () =>
      [...songs].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [songs]
  );

  const handleCreateSong = async (title: string) => {
    if (!user) return false;
    try {
      const created = await createSong(user.id, { title, status: "idea" });
      if (!created) {
        console.error("Create song failed");
        return false;
      }
      setSongs((prev) => [...prev, created]);
      return true;
    } catch (error) {
      console.error("Create song threw error", error);
      return false;
    }
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

        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : sortedSongs.length === 0 ? (
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
            <NewSongInput onCreated={handleCreateSong} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <NewSongInput onCreated={handleCreateSong} />
            {sortedSongs.map((song, index) => (
              <div
                key={song.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <SongCard song={song} project={undefined} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
