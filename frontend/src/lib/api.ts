import type {
  ApiError,
  AuthResponse,
  Todo,
  TodoFilters,
  TodoInput,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "todo_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const payload = res.headers
    .get("content-type")
    ?.includes("application/json")
    ? await res.json()
    : null;

  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      if (typeof window !== "undefined" && !path.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    const err = new Error(
      payload?.message ?? `Request failed with status ${res.status}`,
    ) as ApiError;
    err.status = res.status;
    err.errors = payload?.errors;
    throw err;
  }

  return payload as T;
}

// Auth
export const auth = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) =>
    request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => request<{ message: string }>("/logout", { method: "POST" }),
  me: () => request<{ data: User }>("/me").then((r) => r.data),
};

// Todos
function buildQuery(filters: Partial<TodoFilters>): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.priority && filters.priority !== "all")
    params.set("priority", filters.priority);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const todos = {
  list: (filters: Partial<TodoFilters> = {}) =>
    request<{ data: Todo[] }>(`/todos${buildQuery(filters)}`).then(
      (r) => r.data,
    ),
  create: (input: TodoInput) =>
    request<{ data: Todo }>("/todos", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.data),
  update: (id: number, input: Partial<TodoInput>) =>
    request<{ data: Todo }>(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((r) => r.data),
  remove: (id: number) =>
    request<void>(`/todos/${id}`, { method: "DELETE" }),
  toggle: (id: number) =>
    request<{ data: Todo }>(`/todos/${id}/toggle`, {
      method: "POST",
    }).then((r) => r.data),
};
