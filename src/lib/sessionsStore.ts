import { SessionsDB, Song, Project, Task, Note, Version, Settings, Section } from "./types";

const DB_KEY = "sessionsDB";

const generateId = (): string => crypto.randomUUID();

const getTimestamp = (): string => new Date().toISOString();

const defaultDB: SessionsDB = {
  songs: [],
  projects: [],
  tasks: [],
  notes: [],
  versions: [],
  settings: {
    theme: "dark",
    aurasEnabled: true
  }
};

export const loadDB = (): SessionsDB => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      saveDB(defaultDB);
      return defaultDB;
    }
    return JSON.parse(data);
  } catch {
    return defaultDB;
  }
};

export const saveDB = (db: SessionsDB): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("sessionsDBUpdated"));
};

// Songs
export const createSong = (title: string, projectId?: string): Song => {
  const db = loadDB();
  const song: Song = {
    id: generateId(),
    title,
    projectId,
    moodTags: [],
    status: "idea",
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };
  db.songs.push(song);
  
  if (projectId) {
    const project = db.projects.find(p => p.id === projectId);
    if (project) {
      project.songIds.push(song.id);
      project.updatedAt = getTimestamp();
    }
  }
  
  saveDB(db);
  return song;
};

export const updateSong = (id: string, updates: Partial<Song>): Song | null => {
  const db = loadDB();
  const index = db.songs.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  db.songs[index] = { ...db.songs[index], ...updates, updatedAt: getTimestamp() };
  saveDB(db);
  return db.songs[index];
};

export const deleteSong = (id: string): void => {
  const db = loadDB();
  db.songs = db.songs.filter(s => s.id !== id);
  db.tasks = db.tasks.filter(t => t.songId !== id);
  db.notes = db.notes.filter(n => n.songId !== id);
  db.versions = db.versions.filter(v => v.songId !== id);
  db.projects.forEach(p => {
    p.songIds = p.songIds.filter(sid => sid !== id);
  });
  saveDB(db);
};

export const getSong = (id: string): Song | undefined => {
  return loadDB().songs.find(s => s.id === id);
};

export const getSongProgress = (songId: string): number => {
  const db = loadDB();
  const tasks = db.tasks.filter(t => t.songId === songId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.done).length;
  return Math.round((done / tasks.length) * 100);
};

// Tasks
export const createTask = (songId: string, section: Section, title: string): Task => {
  const db = loadDB();
  const sectionTasks = db.tasks.filter(t => t.songId === songId && t.section === section);
  const task: Task = {
    id: generateId(),
    songId,
    section,
    title,
    done: false,
    order: sectionTasks.length,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };
  db.tasks.push(task);
  saveDB(db);
  return task;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const db = loadDB();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  db.tasks[index] = { ...db.tasks[index], ...updates, updatedAt: getTimestamp() };
  saveDB(db);
  return db.tasks[index];
};

export const toggleTaskDone = (id: string): Task | null => {
  const db = loadDB();
  const task = db.tasks.find(t => t.id === id);
  if (!task) return null;
  return updateTask(id, { done: !task.done });
};

export const deleteTask = (id: string): void => {
  const db = loadDB();
  db.tasks = db.tasks.filter(t => t.id !== id);
  saveDB(db);
};

export const getTasksBySong = (songId: string): Task[] => {
  return loadDB().tasks.filter(t => t.songId === songId).sort((a, b) => a.order - b.order);
};

export const getTasksBySection = (section: Section): Task[] => {
  return loadDB().tasks.filter(t => t.section === section);
};

// Projects
export const createProject = (title: string, description?: string): Project => {
  const db = loadDB();
  const project: Project = {
    id: generateId(),
    title,
    description,
    songIds: [],
    createdAt: getTimestamp(),
    updatedAt: getTimestamp()
  };
  db.projects.push(project);
  saveDB(db);
  return project;
};

export const updateProject = (id: string, updates: Partial<Project>): Project | null => {
  const db = loadDB();
  const index = db.projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  db.projects[index] = { ...db.projects[index], ...updates, updatedAt: getTimestamp() };
  saveDB(db);
  return db.projects[index];
};

export const deleteProject = (id: string): void => {
  const db = loadDB();
  const project = db.projects.find(p => p.id === id);
  if (project) {
    project.songIds.forEach(songId => {
      const song = db.songs.find(s => s.id === songId);
      if (song) song.projectId = undefined;
    });
  }
  db.projects = db.projects.filter(p => p.id !== id);
  saveDB(db);
};

export const getProject = (id: string): Project | undefined => {
  return loadDB().projects.find(p => p.id === id);
};

// Notes
export const createNote = (songId: string, content: string): Note => {
  const db = loadDB();
  const note: Note = {
    id: generateId(),
    songId,
    content,
    updatedAt: getTimestamp()
  };
  db.notes.push(note);
  saveDB(db);
  return note;
};

export const updateNote = (id: string, content: string): Note | null => {
  const db = loadDB();
  const index = db.notes.findIndex(n => n.id === id);
  if (index === -1) return null;
  
  db.notes[index] = { ...db.notes[index], content, updatedAt: getTimestamp() };
  saveDB(db);
  return db.notes[index];
};

export const deleteNote = (id: string): void => {
  const db = loadDB();
  db.notes = db.notes.filter(n => n.id !== id);
  saveDB(db);
};

export const getNotesBySong = (songId: string): Note[] => {
  return loadDB().notes.filter(n => n.songId === songId);
};

// Versions
export const createVersion = (songId: string, name: string, notes?: string): Version => {
  const db = loadDB();
  const version: Version = {
    id: generateId(),
    songId,
    name,
    notes,
    createdAt: getTimestamp()
  };
  db.versions.push(version);
  saveDB(db);
  return version;
};

export const updateVersion = (id: string, updates: Partial<Version>): Version | null => {
  const db = loadDB();
  const index = db.versions.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  db.versions[index] = { ...db.versions[index], ...updates };
  saveDB(db);
  return db.versions[index];
};

export const deleteVersion = (id: string): void => {
  const db = loadDB();
  db.versions = db.versions.filter(v => v.id !== id);
  saveDB(db);
};

export const getVersionsBySong = (songId: string): Version[] => {
  return loadDB().versions.filter(v => v.songId === songId);
};

// Settings
export const getSettings = (): Settings => {
  return loadDB().settings;
};

export const updateSettings = (updates: Partial<Settings>): Settings => {
  const db = loadDB();
  db.settings = { ...db.settings, ...updates };
  saveDB(db);
  return db.settings;
};

// Export/Import
export const exportData = (): string => {
  return JSON.stringify(loadDB(), null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as SessionsDB;
    if (data.songs && data.projects && data.tasks && data.notes && data.versions && data.settings) {
      saveDB(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
