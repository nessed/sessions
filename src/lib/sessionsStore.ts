import {
  SessionsDB,
  Song,
  Project,
  Task,
  Note,
  Version,
  Settings,
  Section,
  FileAttachment,
  Activity,
  Template,
  ActivityType,
  Priority,
} from "./types";

const DB_KEY = "sessionsDB";

const generateId = (): string => crypto.randomUUID();

const getTimestamp = (): string => new Date().toISOString();

const defaultDB: SessionsDB = {
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
    updatedAt: getTimestamp(),
  };
  db.songs.push(song);

  if (projectId) {
    const project = db.projects.find((p) => p.id === projectId);
    if (project) {
      project.songIds.push(song.id);
      project.updatedAt = getTimestamp();
    }
  }

  saveDB(db);
  logActivity("created", "song", song.id, song.title);
  return song;
};

export const updateSong = (id: string, updates: Partial<Song>): Song | null => {
  const db = loadDB();
  const index = db.songs.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const oldSong = { ...db.songs[index] };
  db.songs[index] = {
    ...db.songs[index],
    ...updates,
    updatedAt: getTimestamp(),
  };
  saveDB(db);

  // Log activity with changes
  const changes: Record<string, any> = {};
  Object.keys(updates).forEach((key) => {
    if (updates[key as keyof Song] !== oldSong[key as keyof Song]) {
      changes[key] = {
        from: oldSong[key as keyof Song],
        to: updates[key as keyof Song],
      };
    }
  });

  let activityType: ActivityType = "updated";
  if (changes.status) activityType = "status_changed";
  if (changes.priority) activityType = "priority_changed";
  if (changes.dueDate) activityType = "due_date_changed";

  logActivity(
    activityType,
    "song",
    db.songs[index].id,
    db.songs[index].title,
    changes
  );
  return db.songs[index];
};

export const deleteSong = (id: string): void => {
  const db = loadDB();
  db.songs = db.songs.filter((s) => s.id !== id);
  db.tasks = db.tasks.filter((t) => t.songId !== id);
  db.notes = db.notes.filter((n) => n.songId !== id);
  db.versions = db.versions.filter((v) => v.songId !== id);
  db.projects.forEach((p) => {
    p.songIds = p.songIds.filter((sid) => sid !== id);
  });
  saveDB(db);
  logActivity("deleted", "song", id, song?.title);
};

export const getSong = (id: string): Song | undefined => {
  return loadDB().songs.find((s) => s.id === id);
};

export const getSongProgress = (songId: string): number => {
  const db = loadDB();
  const tasks = db.tasks.filter((t) => t.songId === songId);
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
};

export const getSectionProgress = (
  songId: string,
  section: Section
): {
  progress: number;
  isComplete: boolean;
  totalTasks: number;
  completedTasks: number;
} => {
  const db = loadDB();
  const sectionTasks = db.tasks.filter(
    (t) => t.songId === songId && t.section === section
  );
  if (sectionTasks.length === 0) {
    return { progress: 0, isComplete: false, totalTasks: 0, completedTasks: 0 };
  }
  const completedTasks = sectionTasks.filter((t) => t.done).length;
  const progress = Math.round((completedTasks / sectionTasks.length) * 100);
  const isComplete =
    completedTasks === sectionTasks.length && sectionTasks.length > 0;
  return {
    progress,
    isComplete,
    totalTasks: sectionTasks.length,
    completedTasks,
  };
};

// Tasks
export const createTask = (
  songId: string,
  section: Section,
  title: string,
  priority?: Priority,
  dueDate?: string
): Task => {
  const db = loadDB();
  const sectionTasks = db.tasks.filter(
    (t) => t.songId === songId && t.section === section
  );
  const task: Task = {
    id: generateId(),
    songId,
    section,
    title,
    done: false,
    order: sectionTasks.length,
    priority,
    dueDate,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };
  db.tasks.push(task);
  saveDB(db);
  logActivity("created", "task", task.id, task.title);
  return task;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const db = loadDB();
  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const oldTask = { ...db.tasks[index] };
  db.tasks[index] = {
    ...db.tasks[index],
    ...updates,
    updatedAt: getTimestamp(),
  };
  saveDB(db);

  // Log activity
  const changes: Record<string, any> = {};
  Object.keys(updates).forEach((key) => {
    if (updates[key as keyof Task] !== oldTask[key as keyof Task]) {
      changes[key] = {
        from: oldTask[key as keyof Task],
        to: updates[key as keyof Task],
      };
    }
  });

  let activityType: ActivityType = "updated";
  if (changes.done) activityType = "completed";
  if (changes.priority) activityType = "priority_changed";
  if (changes.dueDate) activityType = "due_date_changed";

  logActivity(
    activityType,
    "task",
    db.tasks[index].id,
    db.tasks[index].title,
    changes
  );
  return db.tasks[index];
};

export const toggleTaskDone = (id: string): Task | null => {
  const db = loadDB();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) return null;

  // Check dependencies
  const { canComplete, blockingTasks } = canCompleteTask(id);
  if (!canComplete && !task.done) {
    // Don't allow completion if dependencies aren't met
    return task;
  }

  return updateTask(id, { done: !task.done });
};

export const deleteTask = (id: string): void => {
  const db = loadDB();
  const task = db.tasks.find((t) => t.id === id);
  db.tasks = db.tasks.filter((t) => t.id !== id);
  // Remove from dependencies
  db.tasks.forEach((t) => {
    if (t.dependsOn?.includes(id)) {
      t.dependsOn = t.dependsOn.filter((depId) => depId !== id);
    }
  });
  saveDB(db);
  logActivity("deleted", "task", id, task?.title);
};

export const getTasksBySong = (songId: string): Task[] => {
  return loadDB()
    .tasks.filter((t) => t.songId === songId)
    .sort((a, b) => a.order - b.order);
};

export const getTasksBySection = (section: Section): Task[] => {
  return loadDB().tasks.filter((t) => t.section === section);
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
    updatedAt: getTimestamp(),
  };
  db.projects.push(project);
  saveDB(db);
  logActivity("created", "project", project.id, project.title);
  return project;
};

export const updateProject = (
  id: string,
  updates: Partial<Project>
): Project | null => {
  const db = loadDB();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.projects[index] = {
    ...db.projects[index],
    ...updates,
    updatedAt: getTimestamp(),
  };
  saveDB(db);
  return db.projects[index];
};

export const deleteProject = (id: string): void => {
  const db = loadDB();
  const project = db.projects.find((p) => p.id === id);
  if (project) {
    project.songIds.forEach((songId) => {
      const song = db.songs.find((s) => s.id === songId);
      if (song) song.projectId = undefined;
    });
  }
  db.projects = db.projects.filter((p) => p.id !== id);
  saveDB(db);
};

export const getProject = (id: string): Project | undefined => {
  return loadDB().projects.find((p) => p.id === id);
};

// Notes
export const createNote = (songId: string, content: string): Note => {
  const db = loadDB();
  const note: Note = {
    id: generateId(),
    songId,
    content,
    updatedAt: getTimestamp(),
  };
  db.notes.push(note);
  saveDB(db);
  return note;
};

export const updateNote = (id: string, content: string): Note | null => {
  const db = loadDB();
  const index = db.notes.findIndex((n) => n.id === id);
  if (index === -1) return null;

  db.notes[index] = { ...db.notes[index], content, updatedAt: getTimestamp() };
  saveDB(db);
  return db.notes[index];
};

export const deleteNote = (id: string): void => {
  const db = loadDB();
  db.notes = db.notes.filter((n) => n.id !== id);
  saveDB(db);
};

export const getNotesBySong = (songId: string): Note[] => {
  return loadDB().notes.filter((n) => n.songId === songId);
};

// Versions
export const createVersion = (
  songId: string,
  name: string,
  notes?: string
): Version => {
  const db = loadDB();
  const version: Version = {
    id: generateId(),
    songId,
    name,
    notes,
    createdAt: getTimestamp(),
  };
  db.versions.push(version);
  saveDB(db);
  return version;
};

export const updateVersion = (
  id: string,
  updates: Partial<Version>
): Version | null => {
  const db = loadDB();
  const index = db.versions.findIndex((v) => v.id === id);
  if (index === -1) return null;

  db.versions[index] = { ...db.versions[index], ...updates };
  saveDB(db);
  return db.versions[index];
};

export const deleteVersion = (id: string): void => {
  const db = loadDB();
  db.versions = db.versions.filter((v) => v.id !== id);
  saveDB(db);
};

export const getVersionsBySong = (songId: string): Version[] => {
  return loadDB().versions.filter((v) => v.songId === songId);
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
    if (
      data.songs &&
      data.projects &&
      data.tasks &&
      data.notes &&
      data.versions &&
      data.settings
    ) {
      // Ensure new arrays exist for backward compatibility
      if (!data.attachments) data.attachments = [];
      if (!data.activities) data.activities = [];
      if (!data.templates) data.templates = [];
      saveDB(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Activity Logging
const logActivity = (
  type: ActivityType,
  entityType: Activity["entityType"],
  entityId: string,
  entityTitle?: string,
  changes?: Record<string, any>
): void => {
  const db = loadDB();
  const activity: Activity = {
    id: generateId(),
    type,
    entityType,
    entityId,
    entityTitle,
    changes,
    createdAt: getTimestamp(),
  };
  db.activities.push(activity);
  // Keep only last 1000 activities
  if (db.activities.length > 1000) {
    db.activities = db.activities.slice(-1000);
  }
  saveDB(db);
};

// File Attachments
export const createAttachment = (
  name: string,
  url: string,
  options?: {
    songId?: string;
    taskId?: string;
    versionId?: string;
    projectId?: string;
    size?: number;
    type?: string;
  }
): FileAttachment => {
  const db = loadDB();
  const attachment: FileAttachment = {
    id: generateId(),
    name,
    url,
    songId: options?.songId,
    taskId: options?.taskId,
    versionId: options?.versionId,
    projectId: options?.projectId,
    size: options?.size,
    type: options?.type,
    uploadedAt: getTimestamp(),
  };
  db.attachments.push(attachment);
  saveDB(db);
  logActivity("created", "song", attachment.id, name);
  return attachment;
};

export const deleteAttachment = (id: string): void => {
  const db = loadDB();
  db.attachments = db.attachments.filter((a) => a.id !== id);
  saveDB(db);
};

export const getAttachmentsBySong = (songId: string): FileAttachment[] => {
  return loadDB().attachments.filter((a) => a.songId === songId);
};

export const getAttachmentsByTask = (taskId: string): FileAttachment[] => {
  return loadDB().attachments.filter((a) => a.taskId === taskId);
};

export const getAttachmentsByProject = (
  projectId: string
): FileAttachment[] => {
  return loadDB().attachments.filter((a) => a.projectId === projectId);
};

// Activity Log
export const getActivities = (
  entityType?: Activity["entityType"],
  entityId?: string,
  limit?: number
): Activity[] => {
  const db = loadDB();
  let activities = db.activities;
  if (entityType) {
    activities = activities.filter((a) => a.entityType === entityType);
  }
  if (entityId) {
    activities = activities.filter((a) => a.entityId === entityId);
  }
  activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return limit ? activities.slice(0, limit) : activities;
};

// Templates
export const createTemplate = (
  name: string,
  type: "song" | "project",
  data: Template["data"],
  description?: string
): Template => {
  const db = loadDB();
  const template: Template = {
    id: generateId(),
    name,
    type,
    description,
    data,
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };
  db.templates.push(template);
  saveDB(db);
  return template;
};

export const updateTemplate = (
  id: string,
  updates: Partial<Template>
): Template | null => {
  const db = loadDB();
  const index = db.templates.findIndex((t) => t.id === id);
  if (index === -1) return null;
  db.templates[index] = {
    ...db.templates[index],
    ...updates,
    updatedAt: getTimestamp(),
  };
  saveDB(db);
  return db.templates[index];
};

export const deleteTemplate = (id: string): void => {
  const db = loadDB();
  db.templates = db.templates.filter((t) => t.id !== id);
  saveDB(db);
};

export const getTemplates = (type?: "song" | "project"): Template[] => {
  const db = loadDB();
  if (type) {
    return db.templates.filter((t) => t.type === type);
  }
  return db.templates;
};

export const getTemplate = (id: string): Template | undefined => {
  return loadDB().templates.find((t) => t.id === id);
};

// Search
export const search = (
  query: string
): {
  songs: Song[];
  projects: Project[];
  tasks: Task[];
  notes: Note[];
} => {
  const db = loadDB();
  const lowerQuery = query.toLowerCase();

  const songs = db.songs.filter(
    (s) =>
      s.title.toLowerCase().includes(lowerQuery) ||
      s.moodTags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      s.key?.toLowerCase().includes(lowerQuery)
  );

  const projects = db.projects.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
  );

  const tasks = db.tasks.filter((t) =>
    t.title.toLowerCase().includes(lowerQuery)
  );

  const notes = db.notes.filter((n) =>
    n.content.toLowerCase().includes(lowerQuery)
  );

  return { songs, projects, tasks, notes };
};

// Reorder songs in project
export const reorderProjectSongs = (
  projectId: string,
  songIds: string[]
): void => {
  const db = loadDB();
  const project = db.projects.find((p) => p.id === projectId);
  if (project) {
    project.songIds = songIds;
    project.updatedAt = getTimestamp();
    // Update song orders
    songIds.forEach((songId, index) => {
      const song = db.songs.find((s) => s.id === songId);
      if (song) {
        song.order = index;
        song.updatedAt = getTimestamp();
      }
    });
    saveDB(db);
    logActivity("updated", "project", projectId, project.title, {
      action: "reordered_songs",
    });
  }
};

// Time tracking
export const logTime = (taskId: string, minutes: number): void => {
  const db = loadDB();
  const task = db.tasks.find((t) => t.id === taskId);
  if (task) {
    task.actualTime = (task.actualTime || 0) + minutes;
    task.updatedAt = getTimestamp();
    saveDB(db);
    logActivity("updated", "task", taskId, task.title, {
      action: "time_logged",
      minutes,
    });
  }
};

// Check task dependencies
export const canCompleteTask = (
  taskId: string
): {
  canComplete: boolean;
  blockingTasks: Task[];
} => {
  const db = loadDB();
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task || !task.dependsOn || task.dependsOn.length === 0) {
    return { canComplete: true, blockingTasks: [] };
  }

  const blockingTasks = db.tasks.filter(
    (t) => task.dependsOn!.includes(t.id) && !t.done
  );

  return {
    canComplete: blockingTasks.length === 0,
    blockingTasks,
  };
};
