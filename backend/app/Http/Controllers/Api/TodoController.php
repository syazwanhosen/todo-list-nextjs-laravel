<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TodoController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('can:view,todo', only: ['show']),
            new Middleware('can:update,todo', only: ['update', 'toggle']),
            new Middleware('can:delete,todo', only: ['destroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->todos()->getQuery();

        $status = $request->string('status')->toString();
        if ($status === 'completed') {
            $query->where('completed', true);
        } elseif ($status === 'active') {
            $query->where('completed', false);
        }

        if ($priority = $request->string('priority')->toString()) {
            if (in_array($priority, ['low', 'medium', 'high'], true)) {
                $query->where('priority', $priority);
            }
        }

        if ($search = $request->string('search')->toString()) {
            $driver = $query->getConnection()->getDriverName();
            $operator = $driver === 'pgsql' ? 'ilike' : 'like';
            $query->where('title', $operator, '%' . $search . '%');
        }

        $sort = $request->string('sort', 'created_at')->toString();
        switch ($sort) {
            case 'due_date':
                $query->orderByRaw('due_date IS NULL')->orderBy('due_date');
                break;
            case 'priority':
                // high -> medium -> low
                $query->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END");
                break;
            default:
                $query->orderByDesc('created_at');
        }

        return TodoResource::collection($query->get());
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        $todo = $request->user()->todos()->create($request->validated())->refresh();

        return (new TodoResource($todo))->response()->setStatusCode(201);
    }

    public function show(Todo $todo): TodoResource
    {
        return new TodoResource($todo);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): TodoResource
    {
        $todo->update($request->validated());

        return new TodoResource($todo);
    }

    public function destroy(Todo $todo): JsonResponse
    {
        $todo->delete();

        return response()->json(null, 204);
    }

    public function toggle(Todo $todo): TodoResource
    {
        $todo->update(['completed' => ! $todo->completed]);

        return new TodoResource($todo);
    }
}
