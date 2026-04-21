"use client";

import type { Priority, SortKey, TodoFilters, TodoStatus } from "@/lib/types";

interface Props {
  filters: TodoFilters;
  onChange: (next: TodoFilters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  function patch<K extends keyof TodoFilters>(key: K, value: TodoFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-200">
      <input
        type="search"
        value={filters.search}
        onChange={(e) => patch("search", e.target.value)}
        placeholder="Search…"
        className="flex-1 min-w-[10rem] rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
      <select
        value={filters.status}
        onChange={(e) => patch("status", e.target.value as TodoStatus)}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={filters.priority}
        onChange={(e) =>
          patch("priority", e.target.value as Priority | "all")
        }
        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
      >
        <option value="all">Any priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        value={filters.sort}
        onChange={(e) => patch("sort", e.target.value as SortKey)}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
      >
        <option value="created_at">Newest</option>
        <option value="due_date">Due date</option>
        <option value="priority">Priority</option>
      </select>
    </div>
  );
}
