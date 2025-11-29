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
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [dominantColor, setDominantColor] = useState<string>("rgba(0,0,0,0.35)");

  useEffect(() => {
    if (id) {
      const projectData = getProject(id);
      setProject(projectData);
      if (projectData) {
        setTitle(projectData.title);
        setDescription(projectData.description || "");
        setCoverPreview(projectData.coverArt);
      }
    }
  }, [id, db]);

  useEffect(() => {
    if (!coverPreview) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = coverPreview;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 32).data;
      let r = 0,
        g = 0,
        b = 0;
      const len = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      r = Math.round(r / len);
      g = Math.round(g / len);
      b = Math.round(b / len);
      setDominantColor(`rgba(${r}, ${g}, ${b}, 0.35)`);
    };
  }, [coverPreview]);

  const handleUpdateTitle = () => {
    if (project && title.trim() && title !== project.title) {
      updateProject(project.id, { title: title.trim() });
      refresh();
    }
    setIsEditingTitle(false);
  };

  const handleCoverUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      if (project) {
        updateProject(project.id, { coverArt: url });
        setCoverPreview(url);
        refresh();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverRemove = () => {
    if (project) {
      updateProject(project.id, { coverArt: undefined });
      setCoverPreview(undefined);
      refresh();
    }
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
      <div className="relative min-h-screen">
        {coverPreview && (
          <>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 20% 20%, ${dominantColor}, transparent 45%), radial-gradient(circle at 80% 30%, ${dominantColor}, transparent 40%), radial-gradient(circle at 50% 80%, ${dominantColor}, transparent 40%)`,
                filter: "blur(32px)",
                opacity: 1,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${coverPreview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(40px)",
                opacity: 0.45,
              }}
            />
            <div
              className="absolute -left-24 -top-24 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
              style={{
                backgroundImage: `url(${coverPreview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute -right-24 bottom-10 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
              style={{
                backgroundImage: `url(${coverPreview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="glass-panel p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-6 items-start">
              <div className="relative group w-full max-w-xs">
                <div className="aspect-square w-full rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-muted/80 via-muted to-muted/50 shadow-lg">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt={`${project.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      Add EP cover
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-3 py-2 rounded-lg bg-white/90 text-sm font-medium text-primary cursor-pointer shadow">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverUpload(file);
                        }}
                      />
                      Upload cover
                    </label>
                    {coverPreview && (
                      <button
                        onClick={handleCoverRemove}
                        className="px-3 py-2 rounded-lg bg-destructive/90 text-sm font-medium text-destructive-foreground shadow hover:bg-destructive"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Ideal for EP/album artwork. Hover to change.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
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

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{songs.length} songs</span>
                  <span>{totalProgress}% complete</span>
                </div>
                <ProgressBar progress={totalProgress} showLabel={false} />
              </div>
            </div>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-aura-peach/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {song.coverArt ? (
                    <img
                      src={song.coverArt}
                      alt={`${song.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-5 h-5 text-primary" />
                  )}
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
      </div>
    </Layout>
  );
};

export default ProjectDetail;
