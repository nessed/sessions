import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { TaskSection } from "@/components/tasks/TaskSection";
import { SmartTaskInput } from "@/components/tasks/SmartTaskInput";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { ProgressBar } from "@/components/songs/ProgressBar";
import { SectionProgressIndicator } from "@/components/songs/SectionProgressIndicator";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import {
  getSong,
  updateSong,
  deleteSong,
  getTasksBySong,
  getSongProgress,
  getNotesBySong,
  createNote,
  updateNote,
  getVersionsBySong,
  createVersion,
  deleteVersion,
} from "@/lib/sessionsStore";
import {
  Song,
  Task,
  Note,
  Version,
  SECTIONS,
  SECTION_LABELS,
  SongStatus,
} from "@/lib/types";
import { ArrowLeft, Trash2, Plus, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrioritySelector } from "@/components/ui/priority-selector";
import { DatePicker } from "@/components/ui/date-picker";

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, refresh } = useSessionsDB();

  const [song, setSong] = useState<Song | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [dominantColor, setDominantColor] = useState<string>("rgba(0,0,0,0.35)");
  const [newTag, setNewTag] = useState("");
  const [newVersionName, setNewVersionName] = useState("");
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  useEffect(() => {
    if (id) {
      const songData = getSong(id);
      setSong(songData);
      if (songData) {
        setTitle(songData.title);
        setCoverPreview(songData.coverArt);
        setTasks(getTasksBySong(id));
        const songNotes = getNotesBySong(id);
        setNotes(songNotes);
        setNoteContent(songNotes[0]?.content || "");
        setVersions(getVersionsBySong(id));
      }
    }
  }, [id, db]);

  // Extract a soft dominant color for background tint
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

  const handleRefresh = () => {
    if (id) {
      // Use a small delay to ensure DB is updated
      setTimeout(() => {
        setSong(getSong(id));
        setTasks(getTasksBySong(id));
        const songNotes = getNotesBySong(id);
        setNotes(songNotes);
        setVersions(getVersionsBySong(id));
        setCoverPreview(getSong(id)?.coverArt);
      }, 0);
    }
    refresh();
  };

  const handleUpdateTitle = () => {
    if (song && title.trim() && title !== song.title) {
      updateSong(song.id, { title: title.trim() });
      handleRefresh();
    }
    setIsEditingTitle(false);
  };

  const handleUpdateStatus = (status: SongStatus) => {
    if (song) {
      updateSong(song.id, { status });
      handleRefresh();
    }
  };

  const handleUpdateField = (
    field: keyof Song,
    value: string | number | undefined
  ) => {
    if (song) {
      updateSong(song.id, { [field]: value || undefined });
      handleRefresh();
    }
  };

  const handleAddTag = () => {
    if (song && newTag.trim() && !song.moodTags.includes(newTag.trim())) {
      updateSong(song.id, { moodTags: [...song.moodTags, newTag.trim()] });
      setNewTag("");
      handleRefresh();
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (song) {
      updateSong(song.id, { moodTags: song.moodTags.filter((t) => t !== tag) });
      handleRefresh();
    }
  };

  const handleNoteBlur = () => {
    if (notes.length > 0) {
      if (noteContent !== notes[0].content) {
        updateNote(notes[0].id, noteContent);
        handleRefresh();
      }
    } else if (noteContent.trim() && song) {
      createNote(song.id, noteContent);
      handleRefresh();
    }
  };

  const handleAddVersion = () => {
    if (song && newVersionName.trim()) {
      createVersion(song.id, newVersionName.trim());
      setNewVersionName("");
      setIsAddingVersion(false);
      handleRefresh();
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    deleteVersion(versionId);
    handleRefresh();
  };

  const handleDelete = () => {
    if (song && confirm("Are you sure you want to delete this song?")) {
      deleteSong(song.id);
      navigate("/");
    }
  };

  const handleCoverUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      if (song) {
        updateSong(song.id, { coverArt: url });
        setCoverPreview(url);
        handleRefresh();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverRemove = () => {
    if (song) {
      updateSong(song.id, { coverArt: undefined });
      setCoverPreview(undefined);
      handleRefresh();
    }
  };

  if (!song) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">Song not found</p>
        </div>
      </Layout>
    );
  }

  const progress = getSongProgress(song.id);

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
        <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {coverPreview && (
              <div className="glass-panel p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/60 border border-border flex-shrink-0">
                  <img
                    src={coverPreview}
                    alt={`${song.title} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Now viewing
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold text-lg">
                      {song.title}
                    </span>
                    <StatusBadge status={song.status} />
                  </div>
                </div>
              </div>
            )}
            {/* Song Info */}
            <div className="glass-panel p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleUpdateTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateTitle();
                        if (e.key === "Escape") {
                          setTitle(song.title);
                          setIsEditingTitle(false);
                        }
                      }}
                      autoFocus
                      className="text-3xl font-display font-bold bg-transparent outline-none w-full"
                    />
                  ) : (
                    <h1
                      onClick={() => setIsEditingTitle(true)}
                      className="text-3xl font-display font-bold cursor-text"
                    >
                      {song.title}
                    </h1>
                  )}
                </div>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-6 mb-6">
                <div className="relative group">
                  <div className="aspect-square w-full max-w-xs rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-muted/80 via-muted to-muted/50 shadow-lg">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt={`${song.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No cover art yet
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
                    Tip: Use square images for best fit. Hover to change.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar progress={progress} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Status
                      </label>
                      <select
                        value={song.status}
                        onChange={(e) =>
                          handleUpdateStatus(e.target.value as SongStatus)
                        }
                        className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        {SECTIONS.map((s) => (
                          <option key={s} value={s}>
                            {SECTION_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        BPM
                      </label>
                      <input
                        type="number"
                        value={song.bpm || ""}
                        onChange={(e) =>
                          handleUpdateField(
                            "bpm",
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        placeholder="120"
                        className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Key
                      </label>
                      <input
                        type="text"
                        value={song.key || ""}
                        onChange={(e) => handleUpdateField("key", e.target.value)}
                        placeholder="C minor"
                        className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Project
                      </label>
                      <select
                        value={song.projectId || ""}
                        onChange={(e) =>
                          handleUpdateField("projectId", e.target.value)
                        }
                        className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">None</option>
                        {db.projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={song.status}
                    onChange={(e) =>
                      handleUpdateStatus(e.target.value as SongStatus)
                    }
                    className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {SECTION_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    BPM
                  </label>
                  <input
                    type="number"
                    value={song.bpm || ""}
                    onChange={(e) =>
                      handleUpdateField(
                        "bpm",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="120"
                    className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Key
                  </label>
                  <input
                    type="text"
                    value={song.key || ""}
                    onChange={(e) => handleUpdateField("key", e.target.value)}
                    placeholder="C minor"
                    className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Project
                  </label>
                  <select
                    value={song.projectId || ""}
                    onChange={(e) =>
                      handleUpdateField("projectId", e.target.value)
                    }
                    className="mt-1 w-full bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">None</option>
                    {db.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Priority
                  </label>
                  <PrioritySelector
                    value={song.priority}
                    onChange={(priority) =>
                      handleUpdateField("priority", priority)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Due Date
                  </label>
                  <DatePicker
                    value={song.dueDate}
                    onChange={(date) => handleUpdateField("dueDate", date)}
                  />
                </div>
              </div>

              {/* Mood Tags */}
              <div className="mb-6">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Mood Tags
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {song.moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="px-3 py-1 rounded-full bg-muted/50 text-sm outline-none focus:ring-2 focus:ring-primary min-w-[100px]"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Project File Link
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="url"
                      value={song.projectFileLink || ""}
                      onChange={(e) =>
                        handleUpdateField("projectFileLink", e.target.value)
                      }
                      placeholder="https://..."
                      className="flex-1 bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    {song.projectFileLink && (
                      <a
                        href={song.projectFileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Drive Link
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="url"
                      value={song.driveLink || ""}
                      onChange={(e) =>
                        handleUpdateField("driveLink", e.target.value)
                      }
                      placeholder="https://..."
                      className="flex-1 bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    {song.driveLink && (
                      <a
                        href={song.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Tasks</h2>
              <SmartTaskInput songId={song.id} onCreated={handleRefresh} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Tasks by section
                </span>
                <button
                  onClick={() => setShowAllSections((prev) => !prev)}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  {showAllSections ? "Hide empty sections" : "Show empty sections"}
                </button>
              </div>
              {(showAllSections
                ? SECTIONS
                : SECTIONS.filter((section) =>
                    tasks.some((t) => t.section === section)
                  )
              ).map((section) => (
                <TaskSection
                  key={section}
                  section={section}
                  tasks={tasks}
                  songId={song.id}
                  onUpdate={handleRefresh}
                />
              ))}
              {!tasks.length && !showAllSections && (
                <p className="text-sm text-muted-foreground px-2 py-4">
                  No tasks yet. Use the smart input above to add your first task.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Section Progress */}
            <div className="glass-panel p-6">
              <SectionProgressIndicator songId={song.id} />
            </div>

            {/* Notes */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Notes</h2>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Write lyrics, ideas, thoughts..."
                className="w-full h-64 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Versions */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold">Versions</h2>
                <button
                  onClick={() => setIsAddingVersion(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {isAddingVersion && (
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="Version name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddVersion();
                      if (e.key === "Escape") {
                        setNewVersionName("");
                        setIsAddingVersion(false);
                      }
                    }}
                    className="flex-1 bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleAddVersion}
                    className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {versions.length === 0 && !isAddingVersion ? (
                  <p className="text-sm text-muted-foreground">
                    No versions yet
                  </p>
                ) : (
                  versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 group"
                    >
                      <span className="text-sm">{version.name}</span>
                      <button
                        onClick={() => handleDeleteVersion(version.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default SongDetail;
