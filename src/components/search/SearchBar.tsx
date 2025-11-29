import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { search } from "@/lib/sessionsStore";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof search> | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(search(query));
      setIsOpen(true);
    } else {
      setResults(null);
      setIsOpen(false);
    }
  }, [query]);

  const totalResults =
    (results?.songs.length || 0) +
    (results?.projects.length || 0) +
    (results?.tasks.length || 0) +
    (results?.notes.length || 0);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, projects, tasks..."
          className="w-full pl-10 pr-10 py-2 bg-muted/50 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-panel p-4 max-h-96 overflow-y-auto z-50 animate-scale-in">
          {totalResults === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No results found
            </p>
          ) : (
            <div className="space-y-4">
              {results.songs.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Songs ({results.songs.length})
                  </h3>
                  <div className="space-y-1">
                    {results.songs.map((song) => (
                      <Link
                        key={song.id}
                        to={`/song/${song.id}`}
                        onClick={() => {
                          setQuery("");
                          setIsOpen(false);
                        }}
                        className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{song.title}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Projects ({results.projects.length})
                  </h3>
                  <div className="space-y-1">
                    {results.projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        onClick={() => {
                          setQuery("");
                          setIsOpen(false);
                        }}
                        className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">
                          {project.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Tasks ({results.tasks.length})
                  </h3>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <Link
                        key={task.id}
                        to={`/song/${task.songId}`}
                        onClick={() => {
                          setQuery("");
                          setIsOpen(false);
                        }}
                        className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{task.title}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
