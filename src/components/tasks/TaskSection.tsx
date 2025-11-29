import { useState } from "react";
import { Task, Section, SECTION_LABELS } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSectionProps {
  section: Section;
  tasks: Task[];
  songId: string;
  onUpdate?: () => void;
}

export const TaskSection = ({
  section,
  tasks,
  songId,
  onUpdate,
}: TaskSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sectionTasks = tasks
    .filter((t) => t.section === section)
    .sort((a, b) => a.order - b.order);

  const completedCount = sectionTasks.filter((t) => t.done).length;
  const totalCount = sectionTasks.length;

  return (
    <div className="mb-2 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="section-header w-full text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="font-display font-semibold">
          {SECTION_LABELS[section]}
        </span>
        <span className="text-xs text-muted-foreground ml-auto font-medium">
          <span
            className={cn(
              completedCount === totalCount &&
                totalCount > 0 &&
                "text-status-release"
            )}
          >
            {completedCount}/{totalCount}
          </span>
        </span>
      </button>

      {isExpanded && (
        <div className="pl-2">
          {sectionTasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};
