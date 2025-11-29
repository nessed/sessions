import { Priority, Section } from "@/lib/types";

const SECTION_REGEX =
  /@(?<section>idea|writing|recording|production|mixing|mastering|release)\b/gi;
const PRIORITY_REGEX = /!(low|medium|high|urgent)\b/gi;
const PRIORITY_SHORTCUT_REGEX = /\bp([1-4])\b/gi;
const DUE_REGEX = /\bdue:(today|tomorrow|\d{4}-\d{2}-\d{2})\b/gi;
const STANDALONE_DATE_REGEX = /\b(today|tomorrow)\b/gi;

const formatDate = (date: Date): string =>
  date.toISOString().split("T")[0];

const resolveDueDate = (keyword: string): string | undefined => {
  const lower = keyword.toLowerCase();
  if (lower === "today") {
    return formatDate(new Date());
  }
  if (lower === "tomorrow") {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return formatDate(date);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(keyword)) {
    return keyword;
  }
  return undefined;
};

const mapPriorityShortcut = (value: string): Priority | undefined => {
  switch (value) {
    case "1":
      return "urgent";
    case "2":
      return "high";
    case "3":
      return "medium";
    case "4":
      return "low";
    default:
      return undefined;
  }
};

export const parseTaskInput = (
  input: string
): {
  title: string;
  section?: Section;
  priority?: Priority;
  dueDate?: string;
} => {
  let section: Section | undefined;
  let priority: Priority | undefined;
  let dueDate: string | undefined;

  // Sections: last occurrence wins
  SECTION_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SECTION_REGEX.exec(input)) !== null) {
    const found = match.groups?.section?.toLowerCase() as Section | undefined;
    if (found) section = found;
  }

  // Priorities (!low, !high...) last occurrence wins
  PRIORITY_REGEX.lastIndex = 0;
  while ((match = PRIORITY_REGEX.exec(input)) !== null) {
    const found = match[1]?.toLowerCase() as Priority | undefined;
    if (found) priority = found;
  }

  // Priority shortcuts (p1..p4) last occurrence wins
  PRIORITY_SHORTCUT_REGEX.lastIndex = 0;
  while ((match = PRIORITY_SHORTCUT_REGEX.exec(input)) !== null) {
    const mapped = mapPriorityShortcut(match[1]);
    if (mapped) priority = mapped;
  }

  // Due dates: due:keyword or standalone today/tomorrow (last wins)
  DUE_REGEX.lastIndex = 0;
  while ((match = DUE_REGEX.exec(input)) !== null) {
    const resolved = resolveDueDate(match[1]);
    if (resolved) dueDate = resolved;
  }

  STANDALONE_DATE_REGEX.lastIndex = 0;
  while ((match = STANDALONE_DATE_REGEX.exec(input)) !== null) {
    const resolved = resolveDueDate(match[1]);
    if (resolved) dueDate = resolved;
  }

  const cleaned = input
    .replace(SECTION_REGEX, "")
    .replace(PRIORITY_REGEX, "")
    .replace(PRIORITY_SHORTCUT_REGEX, "")
    .replace(DUE_REGEX, "")
    .replace(STANDALONE_DATE_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    title: cleaned,
    section,
    priority,
    dueDate,
  };
};
