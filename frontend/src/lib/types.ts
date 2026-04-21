export type Priority = "low" | "medium" | "high";

export type TodoStatus = "all" | "active" | "completed";

export type SortKey = "created_at" | "due_date" | "priority";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
  completed?: boolean;
}

export interface TodoFilters {
  status: TodoStatus;
  priority: Priority | "all";
  search: string;
  sort: SortKey;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}
