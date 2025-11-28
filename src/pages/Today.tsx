import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { TaskItem } from "@/components/tasks/TaskItem";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { Calendar, Music } from "lucide-react";

const Today = () => {
  const { db, refresh } = useSessionsDB();

  // Group tasks marked as "today" by song
  const todayTasks = db.tasks.filter((t) => t.today && !t.done);
  const tasksBySong = todayTasks.reduce((acc, task) => {
    if (!acc[task.songId]) {
      acc[task.songId] = [];
    }
    acc[task.songId].push(task);
    return acc;
  }, {} as Record<string, typeof todayTasks>);

  const getSong = (songId: string) => db.songs.find((s) => s.id === songId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Today</h1>
          <p className="text-muted-foreground">Your session plan for today</p>
        </header>

        {Object.keys(tasksBySong).length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-status-production/20 to-aura-peach/20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-status-production" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">No tasks for today</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Mark tasks as "Today" from any song to build your session plan. Click the calendar icon on any task to add it here.
            </p>
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

export default Today;
