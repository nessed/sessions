import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { createProject, deleteProject, getSongProgress } from "@/lib/sessionsStore";
import { Disc, Plus, Trash2 } from "lucide-react";

const Projects = () => {
  const { db, refresh } = useSessionsDB();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = () => {
    if (newTitle.trim()) {
      createProject(newTitle.trim());
      setNewTitle("");
      setIsAdding(false);
      refresh();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      refresh();
    }
  };

  const getProjectProgress = (songIds: string[]) => {
    if (songIds.length === 0) return 0;
    const total = songIds.reduce((acc, id) => acc + getSongProgress(id), 0);
    return Math.round(total / songIds.length);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">EPs / Albums</h1>
          <p className="text-muted-foreground">Group your songs into projects</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Add New Project */}
          {isAdding ? (
            <div className="glass-panel p-6 animate-scale-in">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Project title..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setNewTitle("");
                    setIsAdding(false);
                  }
                }}
                className="w-full bg-transparent text-lg font-display font-semibold outline-none mb-4 placeholder:text-muted-foreground/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setNewTitle("");
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="glass-panel p-6 flex items-center gap-3 text-muted-foreground hover:text-foreground hover-lift"
            >
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">New Project</span>
            </button>
          )}

          {/* Project Cards */}
          {db.projects.map((project) => {
            const songs = db.songs.filter((s) => project.songIds.includes(s.id));
            const progress = getProjectProgress(project.songIds);

            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="glass-panel p-6 hover-lift block animate-fade-in group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aura-lavender/30 to-aura-teal/30 flex items-center justify-center overflow-hidden">
                    {project.coverArt ? (
                      <img
                        src={project.coverArt}
                        alt={`${project.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Disc className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display font-semibold text-lg mb-1">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{songs.length} songs</span>
                  <span>{progress}% complete</span>
                </div>

                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-aura-teal rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {db.projects.length === 0 && !isAdding && (
          <div className="glass-panel p-12 text-center mt-8">
            <Disc className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground">Create an EP or album to group your songs together</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
