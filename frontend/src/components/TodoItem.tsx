"use client";

import { useState } from "react";
import type { Priority, Todo, TodoInput } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";

interface Props {
  todo: Todo;
  onToggle: (id: number) => Promise<void>;
  onUpdate: (id: number, patch: Partial<TodoInput>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function formatDueDate(value: string | null): {
  label: string;
  overdue: boolean;
} | null {
  if (!value) return null;
  const date = new Date(value);
  const now = new Date();
  const overdue = date < now;
  return {
    label: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    overdue,
  };
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [dueDate, setDueDate] = useState(
    todo.due_date ? todo.due_date.slice(0, 10) : "",
  );

  const due = formatDueDate(todo.due_date);

  async function saveEdits() {
    await onUpdate(todo.id, {
      title: title.trim() || todo.title,
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    });
    setEditing(false);
  }

  function cancelEdits() {
    setTitle(todo.title);
    setDescription(todo.description ?? "");
    setPriority(todo.priority);
    setDueDate(todo.due_date ? todo.due_date.slice(0, 10) : "");
    setEditing(false);
  }

  return (
    <li className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300"
      />

      <div className="flex-1 min-w-0 space-y-1">
        {editing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Description"
              className="w-full resize-y rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="rounded-md border border-slate-300 px-2 py-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`font-medium ${
                  todo.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-900"
                }`}
              >
                {todo.title}
              </p>
              <PriorityBadge priority={todo.priority} />
              {due && (
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs ring-1 ${
                    due.overdue && !todo.completed
                      ? "bg-red-50 text-red-700 ring-red-200"
                      : "bg-slate-50 text-slate-600 ring-slate-200"
                  }`}
                >
                  Due {due.label}
                </span>
              )}
            </div>
            {todo.description && (
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {todo.description}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1 text-xs">
        {editing ? (
          <>
            <button
              type="button"
              onClick={saveEdits}
              className="rounded border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdits}
              className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}
