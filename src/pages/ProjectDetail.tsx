import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { ProgressBar } from "@/components/songs/ProgressBar";
import { NewSongInput } from "@/components/songs/NewSongInput";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { getProject, updateProject, getSongProgress } from "@/lib/sessionsStore";
import { Project, Song } from "@/lib/types";
import { ArrowLeft, Music, Trash2 } from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, refresh } = useSessionsDB();

  const [project, setProject] = useState<Project | undefined>();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (id) {
      const projectData = getProject(id);
      setProject(projectData);
      if (projectData) {
        setTitle(projectData.title);
        setDescription(projectData.description || "");
      }
    }
  }, [id, db]);

  const handleUpdateTitle = () => {
    if (project && title.trim() && title !== project.title) {
      updateProject(project.id, { title: title.trim() });
      refresh();
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = () => {
    if (project && description !== project.description) {
      updateProject(project.id, { description: description.trim() || undefined });
      refresh();
    }
  };

  if (!project) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </Layout>
    );
  }

  const songs = db.songs.filter((s) => project.songIds.includes(s.id));
  const totalProgress = songs.length > 0
    ? Math.round(songs.reduce((acc, s) => acc + getSongProgress(s.id), 0) / songs.length)
    : 0;

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
            className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
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
          <NewSongInput projectId={project.id} onCreated={refresh} />

          {songs.map((song, index) => {
            const progress = getSongProgress(song.id);

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
                <div className="hidden md:block w-32">
                  <ProgressBar progress={progress} showLabel={false} />
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
