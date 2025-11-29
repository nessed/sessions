import { useState, useEffect } from "react";
import { SessionsDB, Settings } from "@/lib/types";

const emptyDB: SessionsDB = {
  songs: [],
  projects: [],
  tasks: [],
  notes: [],
  versions: [],
  attachments: [],
  activities: [],
  templates: [],
  settings: {
    theme: "dark",
    aurasEnabled: true,
  },
};

export const useSessionsDB = () => {
  const [db] = useState<SessionsDB>(emptyDB);
  const [saved] = useState(false);
  const refresh = () => {};
  return { db, refresh, saved };
};

export const useTheme = () => {
  const [settings, setSettings] = useState<Settings>(emptyDB.settings);

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
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  const toggleAuras = () => {
    setSettings((prev) => ({ ...prev, aurasEnabled: !prev.aurasEnabled }));
  };

  return { settings, toggleTheme, toggleAuras };
};
