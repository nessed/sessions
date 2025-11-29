import { supabase } from "@/lib/supabaseClient";
import { Project, Song, Task } from "@/lib/types";

// Utility mappers between Supabase rows and app types
const mapSong = (row: any): Song => ({
  id: row.id,
  title: row.title,
  projectId: row.project_id || undefined,
  bpm: row.bpm || undefined,
  key: row.song_key || undefined,
  moodTags: row.mood_tags || [],
  status: row.status || "idea",
  coverArt: row.cover_art_url || undefined,
  driveLink: row.drive_link || undefined,
  projectFileLink: row.project_file_link || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  order: row.order_position || 0,
});

const mapProject = (row: any): Project => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  songIds: [], // we don't hydrate songs here
  priority: undefined,
  dueDate: undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTask = (row: any): Task => ({
  id: row.id,
  songId: row.song_id,
  section: row.section,
  title: row.title,
  done: row.done,
  order: row.order_position ?? 0,
  today: false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// SONGS
export const getSongs = async (userId: string): Promise<Song[]> => {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getSongs error", error);
    return [];
  }
  console.log("Loaded songs from Supabase", data?.length || 0);
  return (data || []).map(mapSong);
};

export const getSongById = async (
  userId: string,
  songId: string
): Promise<Song | null> => {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", userId)
    .eq("id", songId)
    .single();
  if (error) {
    console.error("getSongById error", error);
    return null;
  }
  return mapSong(data);
};

export const createSong = async (
  userId: string,
  partial: {
    title: string;
    status?: string;
    bpm?: number | null;
    song_key?: string | null;
    mood_tags?: string[] | null;
    project_id?: string | null;
  }
): Promise<Song | null> => {
  const insertPayload = {
    user_id: userId,
    title: partial.title,
    status: partial.status ?? "idea",
    bpm: partial.bpm ?? null,
    song_key: partial.song_key ?? null,
    mood_tags: partial.mood_tags ?? [],
    project_id: partial.project_id ?? null,
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(insertPayload)
    .select("*")
    .single();
  if (error) {
    console.error("createSong error", error);
    return null;
  }
  return mapSong(data);
};

export const updateSong = async (
  userId: string,
  songId: string,
  patch: Partial<Song>
): Promise<Song | null> => {
  const { data, error } = await supabase
    .from("songs")
    .update({
      title: patch.title,
      status: patch.status,
      bpm: patch.bpm ?? null,
      song_key: patch.key ?? null,
      mood_tags: patch.moodTags,
      cover_art_url: patch.coverArt,
      project_id: patch.projectId ?? null,
    })
    .eq("id", songId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    console.error("updateSong error", error);
    return null;
  }
  return mapSong(data);
};

export const deleteSong = async (
  userId: string,
  songId: string
): Promise<void> => {
  const { error } = await supabase
    .from("songs")
    .delete()
    .eq("id", songId)
    .eq("user_id", userId);
  if (error) {
    console.error("deleteSong error", error);
  }
};

// TASKS
export const getTasks = async (
  userId: string,
  songId: string
): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("song_id", songId)
    .order("order_position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getTasks error", error);
    return [];
  }
  console.log("Loaded tasks from Supabase", data?.length || 0);
  return (data || []).map(mapTask);
};

export const createTask = async (
  userId: string,
  songId: string,
  partial: { section: string; title: string; order_position?: number }
): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      song_id: songId,
      section: partial.section,
      title: partial.title,
      order_position: partial.order_position ?? 0,
      done: false,
    })
    .select("*")
    .single();
  if (error) {
    console.error("createTask error", error);
    return null;
  }
  return mapTask(data);
};

export const updateTask = async (
  userId: string,
  taskId: string,
  patch: Partial<Task>
): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: patch.title,
      section: patch.section,
      done: patch.done,
      order_position: patch.order,
    })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) {
    console.error("updateTask error", error);
    return null;
  }
  return mapTask(data);
};

export const deleteTask = async (
  userId: string,
  taskId: string
): Promise<void> => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);
  if (error) {
    console.error("deleteTask error", error);
  }
};

// Projects
export const getProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getProjects error", error);
    return [];
  }
  return (data || []).map(mapProject);
};

export const getProjectById = async (
  userId: string,
  projectId: string
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("id", projectId)
    .single();
  if (error) {
    console.error("getProjectById error", error);
    return null;
  }
  return mapProject(data);
};

export const createProject = async (
  userId: string,
  partial: { title: string; description?: string | null }
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      title: partial.title,
      description: partial.description ?? null,
    })
    .select("*")
    .single();
  if (error) {
    console.error("createProject error", error);
    return null;
  }
  return mapProject(data);
};

export const updateProject = async (
  userId: string,
  projectId: string,
  patch: Partial<Project>
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .update({
      title: patch.title,
      description: patch.description ?? null,
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) {
    console.error("updateProject error", error);
    return null;
  }
  return mapProject(data);
};

export const deleteProject = async (
  userId: string,
  projectId: string
): Promise<void> => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);
  if (error) {
    console.error("deleteProject error", error);
  }
};
