import type { Priority } from "@/lib/types";

const CLASSES: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-700 ring-slate-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-red-50 text-red-700 ring-red-200",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${CLASSES[priority]}`}
    >
      {priority}
    </span>
  );
}
