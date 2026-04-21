"use client";

import type { Todo, TodoInput } from "@/lib/types";
import { TodoItem } from "./TodoItem";

interface Props {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: number) => Promise<void>;
  onUpdate: (id: number, patch: Partial<TodoInput>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoList({ todos, loading, onToggle, onUpdate, onDelete }: Props) {
  if (loading && todos.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">Loading…</p>;
  }

  if (todos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        No todos match your filters. Add one above!
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
