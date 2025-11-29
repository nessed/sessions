import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/auth/AuthProvider";
import {
  createTask,
  deleteSong,
  deleteTask,
  getSongById,
  getTasks,
  updateSong,
  updateTask,
} from "@/lib/supabaseStore";
import { Song, Task, SECTIONS, SECTION_LABELS, SongStatus } from "@/lib/types";
import { ArrowLeft, Music2, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/songs/StatusBadge";

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [song, setSong] = useState<Song | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickTask, setQuickTask] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      setLoading(true);
      try {
        const songData = await getSongById(user.id, id);
        const taskData = await getTasks(user.id, id);
        setSong(songData);
        setTasks(taskData);
        setTitle(songData?.title || "");
      } catch (error) {
        console.error("Failed to load song detail", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, id]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const groupedTasks = useMemo(
    () =>
      SECTIONS.map((section) => ({
        section,
        tasks: tasks.filter((t) => t.section === section),
      })).filter((g) => g.tasks.length > 0),
    [tasks]
  );

  const sectionProgress = useMemo(
    () =>
      SECTIONS.map((section) => {
        const sectionTasks = tasks.filter((t) => t.section === section);
        const done = sectionTasks.filter((t) => t.done).length;
        const percent = sectionTasks.length
          ? Math.round((done / sectionTasks.length) * 100)
          : 0;

        return { section, done, total: sectionTasks.length, percent };
      }).filter((s) => s.total > 0),
    [tasks]
  );

  const handleUpdateTitle = async () => {
    if (!user || !song) return;
    if (!title.trim() || title === song.title) {
      setIsEditingTitle(false);
      setTitle(song.title);
      return;
    }
    const updated = await updateSong(user.id, song.id, { title: title.trim() });
    if (updated) setSong(updated);
    setIsEditingTitle(false);
  };

  const handleDeleteSong = async () => {
    if (song && user && confirm("Delete this song?")) {
      await deleteSong(user.id, song.id);
      navigate("/");
    }
  };

  const handleAddTask = async (section: string, taskTitle: string) => {
    if (!user || !song || !taskTitle.trim()) return;
    try {
      const newTask = await createTask(user.id, song.id, {
        section,
        title: taskTitle.trim(),
        order_position: tasks.length,
      });
      if (!newTask) {
        console.error("createTask failed");
        return;
      }
      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error("createTask threw error", error);
    }
  };

  const handleQuickAdd = async () => {
    await handleAddTask("idea", quickTask);
    setQuickTask("");
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    try {
      const updated = await updateTask(user.id, task.id, { done: !task.done });
      if (!updated) {
        console.error("updateTask failed");
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      console.error("updateTask threw error", error);
    }
  };

  const removeTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteTask(user.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("deleteTask threw error", error);
    }
  };

  if (!song && !loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20 text-white">
          Song not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-16 px-6 text-white space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {song ? (
          <>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.35),transparent_45%)]" />
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.35),transparent_40%)]" />
              <div className="relative p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <Music2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-3">
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
                          className="w-full bg-transparent text-5xl md:text-6xl font-bold tracking-tighter outline-none"
                        />
                      ) : (
                        <h1
                          className="text-5xl md:text-6xl font-bold tracking-tighter text-white cursor-text"
                          onClick={() => setIsEditingTitle(true)}
                        >
                          {song.title}
                        </h1>
                      )}
                      <div className="flex items-center flex-wrap gap-3 text-sm text-zinc-300">
                        <StatusBadge status={song.status as SongStatus} variant="minimal" className="text-zinc-200" />
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span>{song.bpm ? `${song.bpm} BPM` : "No BPM"}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span>{song.key ? song.key.toUpperCase() : "Key TBD"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Progress</div>
                    <div className="text-4xl font-display font-semibold">{progress}%</div>
                    <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden ml-auto">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-200">
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 shadow-inner">
                    <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Tasks</div>
                    <div className="text-2xl font-display font-semibold">{tasks.length}</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 shadow-inner">
                    <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Done</div>
                    <div className="text-2xl font-display font-semibold">{tasks.filter((t) => t.done).length}</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 shadow-inner">
                    <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Sections</div>
                    <div className="text-2xl font-display font-semibold">{sectionProgress.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-zinc-900/60 to-zinc-900/30 shadow-xl">
                <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Tasks</div>
                    <h2 className="text-xl font-display font-semibold">What’s next</h2>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <input
                      value={quickTask}
                      onChange={(e) => setQuickTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleQuickAdd();
                        }
                      }}
                      placeholder='Add task… (e.g., "Mix vocals")'
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                    />
                    <button
                      onClick={handleQuickAdd}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                  {groupedTasks.map((group) => (
                    <div key={group.section} className="space-y-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
                        <span>{SECTION_LABELS[group.section]}</span>
                        <span className="text-zinc-600">{group.tasks.filter((t) => t.done).length}/{group.tasks.length}</span>
                      </div>
                      <div className="space-y-2">
                        {group.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-sm text-zinc-200 hover:border-emerald-300/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleTask(task)}
                                className="w-5 h-5 rounded-full border border-zinc-600 flex items-center justify-center bg-black/30 hover:border-emerald-300"
                              >
                                {task.done && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                              </button>
                              <span className={task.done ? "opacity-50 line-through" : ""}>{task.title}</span>
                            </div>
                            <button
                              onClick={() => removeTask(task.id)}
                              className="text-zinc-600 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!groupedTasks.length && (
                    <div className="text-sm text-zinc-500">No tasks yet. Add one above.</div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-zinc-900/70 to-zinc-900/30 shadow-xl">
                  <div className="px-6 py-5 border-b border-white/5">
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Section progress</div>
                    <h3 className="text-lg font-display font-semibold">Where you’re at</h3>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    {sectionProgress.length ? (
                      sectionProgress.map((section) => (
                        <div key={section.section} className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-zinc-200">
                            <span>{SECTION_LABELS[section.section]}</span>
                            <span className="text-zinc-500">{section.percent}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400"
                              style={{ width: `${section.percent}%` }}
                            />
                          </div>
                          <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
                            {section.done} done / {section.total} tasks
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No section activity yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 px-6 py-5 text-sm text-zinc-300 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Song</div>
                      <div className="text-lg font-display font-semibold">Manage</div>
                    </div>
                    <StatusBadge status={song.status as SongStatus} variant="minimal" className="text-zinc-200" />
                  </div>
                  <button
                    onClick={handleDeleteSong}
                    className="flex items-center gap-2 text-red-300 hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4" /> Delete song
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-white">Loading...</div>
        )}
      </div>
    </Layout>
  );
};

export default SongDetail;
