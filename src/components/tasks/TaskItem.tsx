import { useState } from "react";
import { Task } from "@/lib/types";
import {
  toggleTaskDone,
  updateTask,
  deleteTask,
  canCompleteTask,
} from "@/lib/sessionsStore";
import { Check, Trash2, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TaskItemProps {
  task: Task;
  onUpdate?: () => void;
}

export const TaskItem = ({ task, onUpdate }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleToggle = () => {
    const { canComplete: canDo, blockingTasks } = canCompleteTask(task.id);
    if (!canDo && !task.done) {
      // Show warning about blocking tasks
      alert(
        `Cannot complete this task. Blocking tasks: ${blockingTasks
          .map((t) => t.title)
          .join(", ")}`
      );
      return;
    }
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
    <div
      className={cn(
        "flex items-start gap-3 py-1",
        task.done && "opacity-60"
      )}
    >
      <button
        onClick={handleToggle}
        className={cn(
          "mt-1 w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
          task.done
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 hover:border-primary"
        )}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
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
          className="flex-1 bg-transparent outline-none text-sm"
        />
      ) : (
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              "text-left text-sm hover:text-foreground transition-colors",
              task.done && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </button>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
            {task.priority && (
              <span className="rounded-full bg-muted px-2 py-0.5">
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  new Date(task.dueDate) < new Date() && !task.done
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(task.dueDate), {
                  addSuffix: true,
                })}
              </span>
            )}
            {task.today && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Today
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-muted-foreground">
        <button
          onClick={handleToggleToday}
          className={cn(
            "p-1 rounded hover:text-foreground",
            task.today && "text-primary"
          )}
          title={task.today ? "Remove from Today" : "Add to Today"}
        >
          <Calendar className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
