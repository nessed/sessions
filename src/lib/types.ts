export type SongStatus = "idea" | "writing" | "recording" | "production" | "mixing" | "mastering" | "release";

export type Section = "idea" | "writing" | "recording" | "production" | "mixing" | "mastering" | "release";

export interface Song {
  id: string;
  title: string;
  projectId?: string;
  bpm?: number;
  key?: string;
  moodTags: string[];
  status: SongStatus;
  projectFileLink?: string;
  driveLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  songIds: string[];
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
  settings: Settings;
}

export const SECTIONS: Section[] = ["idea", "writing", "recording", "production", "mixing", "mastering", "release"];

export const SECTION_LABELS: Record<Section, string> = {
  idea: "Idea",
  writing: "Writing",
  recording: "Recording",
  production: "Production",
  mixing: "Mixing",
  mastering: "Mastering",
  release: "Release Prep"
};
