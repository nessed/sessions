import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import {
  createNote,
  createTask,
  createVersion,
  deleteSong,
  deleteVersion,
  getAttachmentsBySong,
  getNotesBySong,
  getSong,
  getSongProgress,
  getTasksBySong,
  getVersionsBySong,
  toggleTaskDone,
  updateNote,
  updateSong,
} from "@/lib/sessionsStore";
import {
  FileAttachment,
  Note,
  SECTIONS,
  SECTION_LABELS,
  Song,
  SongStatus,
  Task,
  Version,
} from "@/lib/types";
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { parseTaskInput } from "@/lib/classifier";

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { db, refresh } = useSessionsDB();

  const [song, setSong] = useState<Song | undefined>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "lyrics" | "notes">(
    "tasks"
  );
  const [quickTask, setQuickTask] = useState("");

  useEffect(() => {
    if (!id) return;
    const songData = getSong(id);
    setSong(songData);
    if (songData) {
      setTitle(songData.title);
      setTasks(getTasksBySong(id));
      const songNotes = getNotesBySong(id);
      setNotes(songNotes);
      setNoteContent(songNotes[0]?.content || "");
      setVersions(getVersionsBySong(id));
      setAttachments(getAttachmentsBySong(id));
    }
  }, [id, db]);

  const progress = useMemo(
    () => (song ? getSongProgress(song.id) : 0),
    [song]
  );

  const handleRefresh = () => {
    if (!id) return;
    setSong(getSong(id));
    setTasks(getTasksBySong(id));
    const songNotes = getNotesBySong(id);
    setNotes(songNotes);
    setNoteContent(songNotes[0]?.content || "");
    setVersions(getVersionsBySong(id));
    setAttachments(getAttachmentsBySong(id));
    refresh();
  };

  const handleUpdateTitle = () => {
    if (song && title.trim() && title !== song.title) {
      updateSong(song.id, { title: title.trim() });
      handleRefresh();
    }
    setIsEditingTitle(false);
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

  const handleDeleteSong = () => {
    if (song && confirm("Delete this song?")) {
      deleteSong(song.id);
      navigate("/");
    }
  };

  const handleQuickAdd = () => {
    if (!song || !quickTask.trim()) return;
    const parsed = parseTaskInput(quickTask);
    const cleanTitle = parsed.title.trim();
    if (!cleanTitle) return;
    const section = parsed.section || "idea";
    createTask(song.id, section, cleanTitle, parsed.priority, parsed.dueDate);
    setQuickTask("");
    handleRefresh();
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

  const groupedTasks = SECTIONS.map((section) => ({
    section,
    tasks: tasks.filter((t) => t.section === section),
  })).filter((group) => group.tasks.length > 0);

  const coverArt = song.coverArt;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pt-20 px-6 text-white">
        <div className="relative h-[30vh] rounded-3xl overflow-hidden mb-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: coverArt
                ? `url(${coverArt})`
                : "linear-gradient(180deg, rgba(17,17,27,0.7), rgba(0,0,0,0.9))",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(30px)",
              transform: "scale(1.1)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-500 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {isEditingTitle ? (
              <input
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
                className="w-full bg-transparent text-7xl font-bold tracking-tighter outline-none"
              />
            ) : (
              <h1
                className="text-7xl font-bold tracking-tighter text-white mb-4"
                onClick={() => setIsEditingTitle(true)}
              >
                {song.title}
              </h1>
            )}
            <div className="flex items-center gap-3 font-mono text-zinc-500 text-sm tracking-widest">
              <StatusBadge status={song.status} variant="minimal" className="text-zinc-400" />
              <span>/</span>
              <span>{song.bpm ? `${song.bpm} BPM` : "— BPM"}</span>
              <span>/</span>
              <span>{song.key ? song.key.toUpperCase() : "—"}</span>
            </div>
            <div className="mt-4 h-px bg-white/10 w-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-12 mt-12">
          {/* Left: Work */}
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-sm">
              {(["tasks", "lyrics", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "text-white border-b border-white pb-1"
                      : "text-zinc-600 pb-1"
                  }
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <input
                    value={quickTask}
                    onChange={(e) => setQuickTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleQuickAdd();
                      }
                    }}
                    placeholder='Add task... (e.g., "Mix vocals !urgent @mixing")'
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                  <button
                    onClick={handleQuickAdd}
                    className="text-zinc-500 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {groupedTasks.map((group) => (
                    <div key={group.section}>
                      <div className="text-xs uppercase text-zinc-600 tracking-[0.2em] mb-2">
                        {SECTION_LABELS[group.section]}
                      </div>
                      <div className="space-y-1">
                        {group.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                          >
                            <CheckCircle2
                              className={`w-4 h-4 cursor-pointer ${
                                task.done ? "text-primary" : "text-zinc-600 hover:text-primary"
                              }`}
                              onClick={() => {
                                toggleTaskDone(task.id);
                                handleRefresh();
                              }}
                            />
                            <span className={task.done ? "opacity-40" : ""}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!groupedTasks.length && (
                    <p className="text-sm text-zinc-500">
                      No tasks yet. Add one above.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "lyrics" && (
              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onBlur={handleNoteBlur}
                  placeholder="Write lyrics..."
                  className="w-full h-64 bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary text-white"
                />
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onBlur={handleNoteBlur}
                  placeholder="Notes..."
                  className="w-full h-64 bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary text-white"
                />
              </div>
            )}
          </div>

          {/* Right: Context */}
          <div className="space-y-6 text-xs text-zinc-500 font-mono">
            <div className="space-y-2">
              <div className="text-sm text-white">Files</div>
              {attachments.length === 0 ? (
                <p className="text-zinc-600">No files attached.</p>
              ) : (
                attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between">
                    <span className="truncate">{file.name}</span>
                    <span className="text-zinc-700">
                      {file.size ? `${Math.round(file.size / 1024)}kb` : ""}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-white">Versions</div>
              {versions.length === 0 ? (
                <p className="text-zinc-600">No versions yet.</p>
              ) : (
                versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span>{version.name}</span>
                    <button
                      onClick={() => handleDeleteVersion(version.id)}
                      className="text-red-500 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
              {isAddingVersion ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="Version name..."
                    className="flex-1 bg-transparent border border-white/5 rounded-lg px-2 py-1 text-xs outline-none text-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddVersion();
                      if (e.key === "Escape") {
                        setNewVersionName("");
                        setIsAddingVersion(false);
                      }
                    }}
                  />
                  <button
                    onClick={handleAddVersion}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingVersion(true)}
                  className="text-xs text-white/70 hover:text-white flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> New Version
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SongDetail;
