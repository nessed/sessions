import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Disc, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Project, Song } from "@/lib/types";
import {
  createProject,
  deleteProject,
  getProjects,
  getSongs,
} from "@/lib/supabaseStore";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "az">("newest");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (!user) {
        setIsLoading(false);
        return;
      }
      const [projData, songData] = await Promise.all([
        getProjects(user.id),
        getSongs(user.id),
      ]);
      setProjects(projData);
      setSongs(songData);
      setIsLoading(false);
    };
    load();
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    if (!newTitle.trim()) return;
    const created = await createProject(user.id, { title: newTitle.trim() });
    if (created) {
      setProjects((prev) => [...prev, created]);
      setNewTitle("");
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(user.id, id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const getProjectProgress = (songIds: string[]) => {
    if (songIds.length === 0) return 0;
    // Without per-song task progress, approximate as 0 for now
    return 0;
  };

  const filteredProjects = projects
    .filter((project) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });

  const totalSongs = songs.length;
  const unassignedSongs = songs.filter((s) => !s.projectId).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">EPs / Albums</h1>
          <p className="text-muted-foreground">Group your songs into projects</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel p-4">
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-2xl font-display font-semibold">{projects.length}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm text-muted-foreground">Songs</p>
              <p className="text-2xl font-display font-semibold">{totalSongs}</p>
            </div>
            <div className="glass-panel p-4">
              <p className="text-sm text-muted-foreground">Unassigned songs</p>
              <p className="text-2xl font-display font-semibold">{unassignedSongs}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects"
                className="glass-panel px-3 py-2 text-sm border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="glass-panel px-3 py-2 text-sm border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="newest">Newest first</option>
                <option value="az">A to Z</option>
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
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
          {isLoading && (
            <>
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="glass-panel p-6 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                  </div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/5" />
                  <div className="mt-4 h-1.5 bg-muted rounded-full" />
                </div>
              ))}
            </>
          )}

          {!isLoading &&
            filteredProjects.map((project) => {
              const projSongs = songs.filter((s) => s.projectId === project.id);
              const progress = getProjectProgress(projSongs.map((s) => s.id));
              const visibleSongs = projSongs.slice(0, 3);

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
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {visibleSongs.map((song) => (
                      <span
                        key={song.id}
                        className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                      >
                        {song.title}
                      </span>
                    ))}
                    {projSongs.length > visibleSongs.length && (
                      <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                        +{projSongs.length - visibleSongs.length} more
                      </span>
                    )}
                    {projSongs.length === 0 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                        No songs yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{projSongs.length} songs</span>
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

        {!isLoading && projects.length === 0 && !isAdding && (
          <div className="glass-panel p-12 text-center mt-8">
            <Disc className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground">Create an EP or album to group your songs together</p>
          </div>
        )}

        {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="glass-panel p-8 text-center mt-8">
            <h2 className="text-lg font-display font-semibold mb-2">No matches found</h2>
            <p className="text-muted-foreground">Try a different search or clear your filters.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
