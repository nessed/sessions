import { useState } from "react";
import { Task, Section, SECTION_LABELS } from "@/lib/types";
import { createTask } from "@/lib/sessionsStore";
import { TaskItem } from "./TaskItem";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSectionProps {
  section: Section;
  tasks: Task[];
  songId: string;
  onUpdate?: () => void;
}

export const TaskSection = ({ section, tasks, songId, onUpdate }: TaskSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const sectionTasks = tasks
    .filter((t) => t.section === section)
    .sort((a, b) => a.order - b.order);

  const completedCount = sectionTasks.filter((t) => t.done).length;
  const totalCount = sectionTasks.length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    createTask(songId, section, newTaskTitle.trim());
    setNewTaskTitle("");
    setIsAdding(false);
    onUpdate?.();
  };

  return (
    <div className="mb-4 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="section-header w-full text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="font-display font-semibold">{SECTION_LABELS[section]}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {completedCount}/{totalCount}
        </span>
      </button>

      {isExpanded && (
        <div className="pl-2">
          {sectionTasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={onUpdate} />
          ))}

          {isAdding ? (
            <form onSubmit={handleAddTask} className="task-item">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 flex-shrink-0" />
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task name..."
                autoFocus
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50"
                onBlur={() => {
                  if (!newTaskTitle.trim()) setIsAdding(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setNewTaskTitle("");
                    setIsAdding(false);
                  }
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className={cn(
                "task-item text-muted-foreground hover:text-foreground w-full"
              )}
            >
              <Plus className="w-5 h-5" />
              <span>Add task</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
