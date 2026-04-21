<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_only_users_todos(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Todo::factory()->count(2)->for($user)->create();
        Todo::factory()->count(3)->for($other)->create();

        $response = $this->actingAs($user)->getJson('/api/todos');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_store_creates_todo_for_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/todos', [
            'title' => 'Buy milk',
            'priority' => 'high',
        ]);

        $response->assertCreated()->assertJsonPath('data.title', 'Buy milk');
        $this->assertDatabaseHas('todos', ['title' => 'Buy milk', 'user_id' => $user->id]);
    }

    public function test_store_requires_title(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/todos', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_update_owns_todo(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create(['title' => 'old']);

        $this->actingAs($user)
            ->patchJson("/api/todos/{$todo->id}", ['title' => 'new'])
            ->assertOk()
            ->assertJsonPath('data.title', 'new');
    }

    public function test_cannot_update_others_todo(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $todo = Todo::factory()->for($other)->create();

        $this->actingAs($user)
            ->patchJson("/api/todos/{$todo->id}", ['title' => 'hacked'])
            ->assertForbidden();
    }

    public function test_destroy_owns_todo(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $this->actingAs($user)
            ->deleteJson("/api/todos/{$todo->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    }

    public function test_cannot_destroy_others_todo(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $todo = Todo::factory()->for($other)->create();

        $this->actingAs($user)
            ->deleteJson("/api/todos/{$todo->id}")
            ->assertForbidden();
    }

    public function test_toggle_flips_completed(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create(['completed' => false]);

        $this->actingAs($user)
            ->postJson("/api/todos/{$todo->id}/toggle")
            ->assertOk()
            ->assertJsonPath('data.completed', true);
    }

    public function test_filter_by_status(): void
    {
        $user = User::factory()->create();
        Todo::factory()->for($user)->create(['completed' => true]);
        Todo::factory()->for($user)->count(2)->create(['completed' => false]);

        $this->actingAs($user)
            ->getJson('/api/todos?status=completed')
            ->assertJsonCount(1, 'data');

        $this->actingAs($user)
            ->getJson('/api/todos?status=active')
            ->assertJsonCount(2, 'data');
    }

    public function test_filter_by_priority(): void
    {
        $user = User::factory()->create();
        Todo::factory()->for($user)->create(['priority' => 'high']);
        Todo::factory()->for($user)->create(['priority' => 'low']);

        $this->actingAs($user)
            ->getJson('/api/todos?priority=high')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.priority', 'high');
    }

    public function test_search_by_title(): void
    {
        $user = User::factory()->create();
        Todo::factory()->for($user)->create(['title' => 'Buy groceries']);
        Todo::factory()->for($user)->create(['title' => 'Walk the dog']);

        $this->actingAs($user)
            ->getJson('/api/todos?search=grocer')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Buy groceries');
    }

    public function test_unauthenticated_cannot_access(): void
    {
        $this->getJson('/api/todos')->assertUnauthorized();
    }
}
