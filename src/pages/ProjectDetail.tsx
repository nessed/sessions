import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { ProgressBar } from "@/components/songs/ProgressBar";
import { NewSongInput } from "@/components/songs/NewSongInput";
import { useAuth } from "@/auth/AuthProvider";
import {
  createSong,
  getProjectById,
  getSongs,
  updateProject,
} from "@/lib/supabaseStore";
import { Project, Song } from "@/lib/types";
import { ArrowLeft, Music, Trash2 } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      const [projData, songData] = await Promise.all([
        getProjectById(user.id, id),
        getSongs(user.id),
      ]);
      setProject(projData);
      setTitle(projData?.title || "");
      setDescription(projData?.description || "");
      setSongs(songData.filter((s) => s.projectId === id));
    };
    load();
  }, [user, id]);

  const handleUpdateTitle = async () => {
    if (!user || !project) return;
    if (!title.trim() || title === project.title) {
      setIsEditingTitle(false);
      setTitle(project.title);
      return;
    }
    const updated = await updateProject(user.id, project.id, {
      title: title.trim(),
    });
    if (updated) setProject(updated);
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = async () => {
    if (!user || !project) return;
    const updated = await updateProject(user.id, project.id, {
      description: description.trim() || null,
    });
    if (updated) setProject(updated);
  };

  const handleCreateSong = async (title: string) => {
    if (!user || !id) return false;
    const created = await createSong(user.id, {
      title,
      status: "idea",
      project_id: id,
    });
    if (!created) {
      console.error("createSong failed from ProjectDetail");
      return false;
    }
    setSongs((prev) => [...prev, created]);
    return true;
  };

  const totalProgress = useMemo(() => {
    if (songs.length === 0) return 0;
    // Without task-level aggregation, default to 0
    return 0;
  }, [songs]);

  if (!project) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="glass-panel p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateTitle();
                  if (e.key === "Escape") {
                    setTitle(project.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-3xl font-display font-bold bg-transparent outline-none flex-1"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-3xl font-display font-bold cursor-text"
              >
                {project.title}
              </h1>
            )}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleUpdateDescription}
            placeholder="Add a description..."
            className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={2}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{songs.length} songs</span>
            <span>{totalProgress}% complete</span>
          </div>
          <ProgressBar progress={totalProgress} showLabel={false} />
        </div>

        <h2 className="text-xl font-display font-semibold mb-4">Songs</h2>

        <div className="space-y-3">
          <NewSongInput projectId={project.id} onCreated={handleCreateSong} />

          {songs.map((song, index) => {
            return (
              <Link
                key={song.id}
                to={`/song/${song.id}`}
                className="glass-panel-subtle p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors animate-fade-in"
              >
                <span className="text-lg font-display font-bold text-muted-foreground w-8">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-aura-peach/20 flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{song.title}</h3>
                </div>
                <StatusBadge status={song.status} />
              </Link>
            );
          })}
        </div>

        {songs.length === 0 && (
          <div className="glass-panel p-8 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No songs in this project yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectDetail;
