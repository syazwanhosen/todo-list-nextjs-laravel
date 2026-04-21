<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'alice@example.com']);
    }

    public function test_register_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'alice@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'alice@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'alice@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_bad_credentials(): void
    {
        User::factory()->create([
            'email' => 'alice@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'alice@example.com',
            'password' => 'wrong',
        ])->assertUnprocessable();
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJson(['data' => ['email' => $user->email]]);
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api');
        $plainText = $token->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $plainText)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token->accessToken->getKey(),
        ]);
    }
}
