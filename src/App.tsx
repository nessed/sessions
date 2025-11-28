import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getSettings } from "@/lib/sessionsStore";
import Index from "./pages/Index";
import SongDetail from "./pages/SongDetail";
import AllSongs from "./pages/AllSongs";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import IdeasVault from "./pages/IdeasVault";
import Today from "./pages/Today";
import FilterView from "./pages/FilterView";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ThemeInitializer = () => {
  useEffect(() => {
    const settings = getSettings();
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/song/:id" element={<SongDetail />} />
          <Route path="/songs" element={<AllSongs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/ideas" element={<IdeasVault />} />
          <Route path="/today" element={<Today />} />
          <Route path="/filter/:section" element={<FilterView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
