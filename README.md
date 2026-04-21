# Todo App — Next.js + Laravel

A full-stack todo app with per-user auth, priorities, due dates, filtering, and search.

- **Backend**: Laravel 11 + Sanctum (Bearer tokens) + PostgreSQL
- **Frontend**: Next.js 16 (App Router, TypeScript) + Tailwind CSS 4

## Prerequisites

- PHP 8.2+ and Composer
- Node.js 20.9+ and npm
- PostgreSQL running locally

## Backend setup (`backend/`)

```bash
cd backend

# Install PHP deps
composer install

# Configure environment — edit .env as needed
cp .env.example .env      # only on first setup; .env already exists after create-project
php artisan key:generate  # only if APP_KEY is missing

# Create the DB and run migrations
createdb todo_app         # or use your existing psql tools
php artisan migrate

# Start the API on http://localhost:8000
php artisan serve
```

`.env` keys of interest:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000   # used by CORS

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=todo_app
DB_USERNAME=<your pg user>
DB_PASSWORD=
```

### Run tests

```bash
php artisan test
```

## Frontend setup (`frontend/`)

```bash
cd frontend

# Install deps
npm install

# Dev server on http://localhost:3000
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Build

```bash
npm run build
```

## API

All `/api/todos*` routes require `Authorization: Bearer <token>`.

| Method | Path                       | Description                                     |
| ------ | -------------------------- | ----------------------------------------------- |
| POST   | `/api/register`            | Register — returns `{user, token}`              |
| POST   | `/api/login`               | Login — returns `{user, token}`                 |
| POST   | `/api/logout`              | Revoke current token                            |
| GET    | `/api/me`                  | Current user                                    |
| GET    | `/api/todos`               | List — query: `status`, `priority`, `search`, `sort` |
| POST   | `/api/todos`               | Create                                          |
| PATCH  | `/api/todos/{id}`          | Update                                          |
| DELETE | `/api/todos/{id}`          | Delete                                          |
| POST   | `/api/todos/{id}/toggle`   | Toggle `completed`                              |

Query params for list:
- `status`: `all` (default) · `active` · `completed`
- `priority`: `low` · `medium` · `high`
- `search`: substring match on title (case-insensitive)
- `sort`: `created_at` (default) · `due_date` · `priority`

## End-to-end smoke test

1. Start backend (`php artisan serve`) and frontend (`npm run dev`)
2. Open http://localhost:3000 → redirected to `/login`
3. Register a user → redirected to `/todos`
4. Add a todo with high priority and a due date
5. Toggle the checkbox, edit title, delete, filter by status/priority, search
6. Log out → redirected to `/login`
7. Register a second user → sees an empty list (ownership enforced)

## Project layout

```
backend/                      # Laravel 11
  app/Http/Controllers/Api/   # AuthController, TodoController
  app/Http/Requests/          # Register/Login/Store/UpdateTodo validation
  app/Http/Resources/         # TodoResource, UserResource
  app/Models/                 # User, Todo
  app/Policies/TodoPolicy.php # ownership checks
  database/migrations/        # users (default) + todos
  routes/api.php              # API routes
  tests/Feature/              # AuthTest, TodoTest (20 tests)

frontend/                     # Next.js 16 (App Router)
  src/app/
    layout.tsx                # wraps children in <AuthProvider>
    page.tsx                  # redirects based on auth state
    login/ register/          # auth pages
    todos/                    # guarded area with header + main
  src/components/             # TodoForm, TodoList, TodoItem, FilterBar, …
  src/context/AuthContext.tsx # token + current user
  src/lib/api.ts              # fetch wrapper, attaches Bearer token
  src/lib/types.ts            # shared TS types
```
