<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\InquiryReminder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InquiryNotesAndRemindersTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Inquiry $inquiry;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'agent',
            'status' => 'active',
        ]);

        $this->inquiry = Inquiry::create([
            'name' => 'Reminder Test Lead',
            'email' => 'reminder@test.com',
            'subject' => 'Follow up needed',
            'message' => 'Needs active reminder follow up',
            'status' => 'contacted',
            'priority' => 'normal',
        ]);
    }

    public function test_can_add_internal_note(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/inquiries/{$this->inquiry->id}/notes", [
                'content' => 'Discussed pricing discount tier over phone.',
                'type' => 'call_log',
                'is_internal' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.content', 'Discussed pricing discount tier over phone.')
            ->assertJsonPath('data.type', 'call_log');

        $this->assertDatabaseHas('inquiry_notes', [
            'inquiry_id' => $this->inquiry->id,
            'user_id' => $this->user->id,
            'type' => 'call_log',
        ]);

        $this->assertDatabaseHas('inquiry_activity_logs', [
            'inquiry_id' => $this->inquiry->id,
            'action' => 'note_added',
        ]);
    }

    public function test_can_create_and_toggle_reminder(): void
    {
        $remindAt = now()->addDays(2)->format('Y-m-d H:i:s');

        $createRes = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/inquiries/{$this->inquiry->id}/reminders", [
                'title' => 'Send revised quote',
                'remind_at' => $remindAt,
                'notes' => 'Include 10% annual billing discount',
            ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.title', 'Send revised quote')
            ->assertJsonPath('data.status', 'pending');

        $reminderId = $createRes->json('data.id');

        // Toggle to completed
        $toggleRes = $this->actingAs($this->user, 'sanctum')
            ->patchJson("/api/reminders/{$reminderId}/toggle");

        $toggleRes->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        $reminder = InquiryReminder::find($reminderId);
        $this->assertEquals('completed', $reminder->status);
        $this->assertNotNull($reminder->completed_at);
    }

    public function test_can_fetch_upcoming_reminders(): void
    {
        InquiryReminder::create([
            'inquiry_id' => $this->inquiry->id,
            'user_id' => $this->user->id,
            'title' => 'Upcoming Action',
            'remind_at' => now()->addHour(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/reminders/upcoming');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.title', 'Upcoming Action');
    }
}
