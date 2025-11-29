export type SongStatus =
  | "idea"
  | "writing"
  | "recording"
  | "production"
  | "mixing"
  | "mastering"
  | "release";

export type Section =
  | "idea"
  | "writing"
  | "recording"
  | "production"
  | "mixing"
  | "mastering"
  | "release";

export type Priority = "low" | "medium" | "high" | "urgent";

export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "completed"
  | "status_changed"
  | "priority_changed"
  | "due_date_changed";

export interface Song {
  id: string;
  title: string;
  projectId?: string;
  bpm?: number;
  key?: string;
  moodTags: string[];
  coverArt?: string;
  audioUrl?: string;
  audioTitle?: string;
  status: SongStatus;
  projectFileLink?: string;
  driveLink?: string;
  priority?: Priority;
  dueDate?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  songIds: string[];
  coverArt?: string;
  priority?: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  songId: string;
  section: Section;
  title: string;
  done: boolean;
  order: number;
  today?: boolean;
  priority?: Priority;
  dueDate?: string;
  dependsOn?: string[];
  estimatedTime?: number;
  actualTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  songId: string;
  content: string;
  updatedAt: string;
}

export interface Version {
  id: string;
  songId: string;
  name: string;
  notes?: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  songId?: string;
  taskId?: string;
  versionId?: string;
  projectId?: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  entityType: "song" | "project" | "task" | "note" | "version";
  entityId: string;
  entityTitle?: string;
  changes?: Record<string, any>;
  userId?: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: "song" | "project";
  description?: string;
  data: {
    tasks?: Array<{ section: Section; title: string; priority?: Priority }>;
    fields?: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  theme: "light" | "dark";
  aurasEnabled: boolean;
}

export interface SessionsDB {
  songs: Song[];
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  versions: Version[];
  attachments: FileAttachment[];
  activities: Activity[];
  templates: Template[];
  settings: Settings;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

export const SECTIONS: Section[] = [
  "idea",
  "writing",
  "recording",
  "production",
  "mixing",
  "mastering",
  "release",
];

export const SECTION_LABELS: Record<Section, string> = {
  idea: "General",
  writing: "Writing",
  recording: "Recording",
  production: "Production",
  mixing: "Mixing",
  mastering: "Mastering",
  release: "Release Prep",
};
