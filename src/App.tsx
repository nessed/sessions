import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/AuthProvider";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

const ThemeInitializer = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
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
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/song/:id"
              element={
                <ProtectedRoute>
                  <SongDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/songs"
              element={
                <ProtectedRoute>
                  <AllSongs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ideas"
              element={
                <ProtectedRoute>
                  <IdeasVault />
                </ProtectedRoute>
              }
            />
            <Route
              path="/today"
              element={
                <ProtectedRoute>
                  <Today />
                </ProtectedRoute>
              }
            />
            <Route
              path="/filter/:section"
              element={
                <ProtectedRoute>
                  <FilterView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
