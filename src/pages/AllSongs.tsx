import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { Song, SongStatus, SECTIONS, SECTION_LABELS } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Music, Filter } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { getSongs } from "@/lib/supabaseStore";

type SortField = "title" | "updatedAt" | "status";
type SortOrder = "asc" | "desc";

const AllSongs = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [statusFilter, setStatusFilter] = useState<SongStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await getSongs(user.id);
        setSongs(data);
      } catch (error) {
        console.error("Failed to load songs in AllSongs", error);
      }
    };
    load();
  }, [user]);

  const filteredSongs = useMemo(
    () =>
      songs
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
        }),
    [songs, sortField, sortOrder, statusFilter]
  );

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
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">All Songs</h1>
          <p className="text-muted-foreground">Browse and filter your music catalog</p>
        </header>

        {/* Filters */}
        <div className="glass-panel p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SongStatus | "all")}
              className="bg-muted/50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{SECTION_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <button
              onClick={() => toggleSort("title")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "title" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              Title
            </button>
            <button
              onClick={() => toggleSort("updatedAt")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "updatedAt" ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              Updated
            </button>
            <button
              onClick={() => toggleSort("status")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "status" ? "bg-primary/10 text-primary" : "hover:bg-muted"
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
          <div className="glass-panel overflow-hidden">
            <div className="divide-y divide-border">
              {filteredSongs.map((song) => (
                <Link
                  key={song.id}
                  to={`/song/${song.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors animate-fade-in"
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
                  </div>
                  <StatusBadge status={song.status} />
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {formatDistanceToNow(new Date(song.updatedAt), { addSuffix: true })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllSongs;
