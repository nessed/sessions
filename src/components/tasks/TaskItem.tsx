import { useState } from "react";
import { Task } from "@/lib/types";
import {
  toggleTaskDone,
  updateTask,
  deleteTask,
  canCompleteTask,
} from "@/lib/sessionsStore";
import { Check, Trash2, Calendar, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrioritySelector } from "@/components/ui/priority-selector";
import { DatePicker } from "@/components/ui/date-picker";
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
    <div className={cn("task-item group", task.done && "opacity-60")}>
      <button
        onClick={handleToggle}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 relative overflow-hidden",
          task.done
            ? "bg-gradient-to-br from-primary to-aura-lavender border-primary shadow-lg"
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
        )}
      >
        {task.done && (
          <>
            <Check className="w-3 h-3 text-primary-foreground relative z-10" />
          </>
        )}
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
        <div className="flex-1 min-w-0">
          <span
            onClick={() => setIsEditing(true)}
            className={cn("cursor-text block", task.done && "line-through")}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {task.priority && (
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  task.priority === "urgent" && "bg-red-500/10 text-red-500",
                  task.priority === "high" &&
                    "bg-orange-500/10 text-orange-500",
                  task.priority === "medium" &&
                    "bg-yellow-500/10 text-yellow-500",
                  task.priority === "low" && "bg-blue-500/10 text-blue-500"
                )}
              >
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  "text-xs",
                  new Date(task.dueDate) < new Date() && !task.done
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                Due{" "}
                {formatDistanceToNow(new Date(task.dueDate), {
                  addSuffix: true,
                })}
              </span>
            )}
            {task.actualTime && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(task.actualTime)}m
              </span>
            )}
          </div>
        </div>
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
