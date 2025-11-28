import { useState } from "react";
import { Task } from "@/lib/types";
import { toggleTaskDone, updateTask, deleteTask } from "@/lib/sessionsStore";
import { Check, Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onUpdate?: () => void;
}

export const TaskItem = ({ task, onUpdate }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleToggle = () => {
    toggleTaskDone(task.id);
    onUpdate?.();
  };

  const handleSave = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
      onUpdate?.();
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onUpdate?.();
  };

  const handleToggleToday = () => {
    updateTask(task.id, { today: !task.today });
    onUpdate?.();
  };

  return (
    <div className={cn("task-item group", task.done && "opacity-60")}>
      <button
        onClick={handleToggle}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
          task.done
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 hover:border-primary"
        )}
      >
        {task.done && <Check className="w-3 h-3 text-primary-foreground" />}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setTitle(task.title);
              setIsEditing(false);
            }
          }}
          autoFocus
          className="flex-1 bg-transparent outline-none"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex-1 cursor-text",
            task.done && "line-through"
          )}
        >
          {task.title}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleToggleToday}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            task.today
              ? "text-status-production bg-status-production/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title={task.today ? "Remove from Today" : "Add to Today"}
        >
          <Calendar className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
