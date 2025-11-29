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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
      <div className="max-w-5xl mx-auto pt-20 px-6 text-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {song ? (
          <>
            <div className="relative h-[30vh] rounded-3xl overflow-hidden mb-10">
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
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
                  <StatusBadge status={song.status as SongStatus} variant="minimal" className="text-zinc-400" />
                  <span>/</span>
                  <span>{song.bpm ? `${song.bpm} BPM` : "— BPM"}</span>
                  <span>/</span>
                  <span>{song.key ? song.key.toUpperCase() : "—"}</span>
                </div>
                <div className="mt-4 h-px bg-white/10 w-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_300px] gap-12 mt-12">
              <div className="space-y-6">
                <div className="flex items-center gap-6 text-sm">
                  {(["tasks", "lyrics", "notes"] as const).map((tab) => (
                    <span
                      key={tab}
                      className={
                        tab === "tasks"
                          ? "text-white border-b border-white pb-1"
                          : "text-zinc-600 pb-1"
                      }
                    >
                      {tab.toUpperCase()}
                    </span>
                  ))}
                </div>

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
                      placeholder='Add task... (e.g., "Mix vocals")'
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
                              className="flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleTask(task)}
                                  className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center hover:border-white"
                                >
                                  {task.done && <span className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                                <span className={task.done ? "opacity-40" : ""}>
                                  {task.title}
                                </span>
                              </div>
                              <button
                                onClick={() => removeTask(task.id)}
                                className="text-zinc-600 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
              </div>

              <div className="space-y-6 text-xs text-zinc-500 font-mono">
                <div className="space-y-2">
                  <div className="text-sm text-white">Song</div>
                  <button
                    onClick={handleDeleteSong}
                    className="text-red-400 hover:text-red-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete song
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white">Versions</div>
                  <p className="text-zinc-600">Not implemented</p>
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
