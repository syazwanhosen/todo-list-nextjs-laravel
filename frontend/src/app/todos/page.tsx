"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { todos as todosApi } from "@/lib/api";
import type { Todo, TodoFilters, TodoInput } from "@/lib/types";

const DEFAULT_FILTERS: TodoFilters = {
  status: "all",
  priority: "all",
  search: "",
  sort: "created_at",
};

export default function TodosPage() {
  const [items, setItems] = useState<Todo[]>([]);
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (next: TodoFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await todosApi.list(next);
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(filters), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, load]);

  async function handleCreate(input: TodoInput) {
    const created = await todosApi.create(input);
    setItems((prev) => [created, ...prev]);
  }

  async function handleToggle(id: number) {
    const updated = await todosApi.toggle(id);
    setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleUpdate(id: number, patch: Partial<TodoInput>) {
    const updated = await todosApi.update(id, patch);
    setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: number) {
    await todosApi.remove(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <TodoForm onSubmit={handleCreate} />
      <FilterBar filters={filters} onChange={setFilters} />
      {error && (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}
      <TodoList
        todos={items}
        loading={loading}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
