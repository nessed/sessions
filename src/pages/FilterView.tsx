import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { TaskItem } from "@/components/tasks/TaskItem";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { Section, SECTION_LABELS } from "@/lib/types";
import { Music } from "lucide-react";

const FilterView = () => {
  const { section } = useParams<{ section: Section }>();
  const { db, refresh } = useSessionsDB();

  if (!section || !SECTION_LABELS[section as Section]) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">Invalid filter</p>
        </div>
      </Layout>
    );
  }

  const sectionKey = section as Section;
  const sectionTasks = db.tasks.filter((t) => t.section === sectionKey && !t.done);

  // Group tasks by song
  const tasksBySong = sectionTasks.reduce((acc, task) => {
    if (!acc[task.songId]) {
      acc[task.songId] = [];
    }
    acc[task.songId].push(task);
    return acc;
  }, {} as Record<string, typeof sectionTasks>);

  const getSong = (songId: string) => db.songs.find((s) => s.id === songId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            {SECTION_LABELS[sectionKey]} Tasks
          </h1>
          <p className="text-muted-foreground">
            All {SECTION_LABELS[sectionKey].toLowerCase()} tasks across your songs
          </p>
        </header>

        {Object.keys(tasksBySong).length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <p className="text-muted-foreground">No pending {SECTION_LABELS[sectionKey].toLowerCase()} tasks</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksBySong).map(([songId, tasks]) => {
              const song = getSong(songId);
              if (!song) return null;

              return (
                <div key={songId} className="glass-panel p-6 animate-fade-in">
                  <Link
                    to={`/song/${songId}`}
                    className="flex items-center gap-3 mb-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-aura-peach/20 flex items-center justify-center">
                      <Music className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                      {song.title}
                    </h2>
                  </Link>

                  <div className="space-y-1">
                    {tasks.map((task) => (
                      <TaskItem key={task.id} task={task} onUpdate={refresh} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FilterView;
