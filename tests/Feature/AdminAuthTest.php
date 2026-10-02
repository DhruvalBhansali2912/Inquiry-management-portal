<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => Hash::make('Secret123!'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'role', 'status'],
            ]);
    }

    public function test_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'admin@test.com',
            'password' => Hash::make('Secret123!'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactive@test.com',
            'password' => Hash::make('Secret123!'),
            'role' => 'agent',
            'status' => 'inactive',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactive@test.com',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_access_me_and_logout(): void
    {
        $user = User::factory()->create([
            'role' => 'manager',
            'status' => 'active',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        // Fetch current user
        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $meResponse->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => 'manager',
                ],
            ]);

        // Logout
        $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        // Verify token deleted from database
        $this->assertCount(0, $user->tokens);

        // Reset auth guards and verify unauthenticated request returns 401
        $this->app['auth']->forgetGuards();
        $subsequentResponse = $this->getJson('/api/auth/me');
        $subsequentResponse->assertStatus(401);
    }
}
