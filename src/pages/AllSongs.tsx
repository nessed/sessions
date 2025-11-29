import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { ProgressBar } from "@/components/songs/ProgressBar";
import { useSessionsDB } from "@/hooks/useSessionsDB";
import { getSongProgress } from "@/lib/sessionsStore";
import { Song, SongStatus, SECTIONS, SECTION_LABELS } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Music, Filter } from "lucide-react";

type SortField = "title" | "updatedAt" | "status";
type SortOrder = "asc" | "desc";

const AllSongs = () => {
  const { db } = useSessionsDB();
  const [statusFilter, setStatusFilter] = useState<SongStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const getProject = (projectId?: string) => {
    if (!projectId) return undefined;
    return db.projects.find((p) => p.id === projectId);
  };

  const filteredSongs = db.songs
    .filter((song) => statusFilter === "all" || song.status === statusFilter)
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "updatedAt") {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortField === "status") {
        comparison = SECTIONS.indexOf(a.status) - SECTIONS.indexOf(b.status);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 pt-6 lg:pt-0">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Catalog</p>
          <h1 className="text-3xl font-display font-semibold text-white mb-2">All Songs</h1>
          <p className="text-muted-foreground">Browse, filter, and jump into any song without visual noise.</p>
        </header>

        {/* Filters */}
        <div className="glass-panel-subtle p-4 mb-6 flex flex-wrap items-center gap-3 border border-white/5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SongStatus | "all")}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Statuses</option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>{SECTION_LABELS[s]}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
            <span>Sort</span>
            <button
              onClick={() => toggleSort("title")}
              className={`px-3 py-1.5 rounded-lg border border-white/5 transition-colors ${
                sortField === "title" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              Title
            </button>
            <button
              onClick={() => toggleSort("updatedAt")}
              className={`px-3 py-1.5 rounded-lg border border-white/5 transition-colors ${
                sortField === "updatedAt"
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              Updated
            </button>
            <button
              onClick={() => toggleSort("status")}
              className={`px-3 py-1.5 rounded-lg border border-white/5 transition-colors ${
                sortField === "status" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              Status
            </button>
          </div>
        </div>

        {/* Songs List */}
        {filteredSongs.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No songs found</p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-white/5">
            <div className="divide-y divide-white/5">
              {filteredSongs.map((song) => {
                const project = getProject(song.projectId);
                const progress = getSongProgress(song.id);

                return (
                  <Link
                    key={song.id}
                    to={`/song/${song.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors animate-fade-in"
                  >
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
                      {project && (
                        <p className="text-sm text-muted-foreground truncate">{project.title}</p>
                      )}
                    </div>
                    <div className="hidden md:block w-32">
                      <ProgressBar progress={progress} showLabel={false} />
                    </div>
                    <StatusBadge status={song.status} />
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {formatDistanceToNow(new Date(song.updatedAt), { addSuffix: true })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllSongs;
