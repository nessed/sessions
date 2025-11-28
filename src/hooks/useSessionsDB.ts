import { useState, useEffect, useCallback } from "react";
import { loadDB, getSettings, updateSettings as saveSettings } from "@/lib/sessionsStore";
import { SessionsDB, Settings } from "@/lib/types";

export const useSessionsDB = () => {
  const [db, setDb] = useState<SessionsDB>(loadDB);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(() => {
    setDb(loadDB());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener("sessionsDBUpdated", handleUpdate);
    return () => window.removeEventListener("sessionsDBUpdated", handleUpdate);
  }, [refresh]);

  return { db, refresh, saved };
};

export const useTheme = () => {
  const [settings, setSettings] = useState<Settings>(getSettings);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    const newTheme = settings.theme === "dark" ? "light" : "dark";
    const updated = saveSettings({ theme: newTheme });
    setSettings(updated);
  };

  const toggleAuras = () => {
    const updated = saveSettings({ aurasEnabled: !settings.aurasEnabled });
    setSettings(updated);
  };

  useEffect(() => {
    const handleUpdate = () => setSettings(getSettings());
    window.addEventListener("sessionsDBUpdated", handleUpdate);
    return () => window.removeEventListener("sessionsDBUpdated", handleUpdate);
  }, []);

  return { settings, toggleTheme, toggleAuras };
};
