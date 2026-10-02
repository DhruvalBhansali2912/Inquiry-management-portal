<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InquiryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $agent;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->agent = User::factory()->create([
            'role' => 'agent',
            'status' => 'active',
        ]);
    }

    public function test_can_list_inquiries_with_pagination(): void
    {
        Inquiry::create([
            'name' => 'Test Lead 1',
            'email' => 'lead1@test.com',
            'subject' => 'Subject 1',
            'message' => 'Message description text 1',
            'status' => 'new',
            'priority' => 'normal',
        ]);

        Inquiry::create([
            'name' => 'Test Lead 2',
            'email' => 'lead2@test.com',
            'subject' => 'Subject 2',
            'message' => 'Message description text 2',
            'status' => 'qualified',
            'priority' => 'high',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/inquiries?per_page=10');

        $response->assertStatus(200)
            ->assertJsonPath('total', 2)
            ->assertJsonStructure(['data', 'current_page', 'total']);
    }

    public function test_can_search_inquiries_by_keyword(): void
    {
        Inquiry::create([
            'name' => 'Robert Oppenheimer',
            'email' => 'robert@losalamos.gov',
            'subject' => 'Physics Research Portal',
            'message' => 'Consulting request for physics portal',
            'status' => 'new',
            'priority' => 'normal',
        ]);

        Inquiry::create([
            'name' => 'Alan Turing',
            'email' => 'alan@bletchley.ac.uk',
            'subject' => 'Decryption Platform',
            'message' => 'Algorithm inquiry',
            'status' => 'new',
            'priority' => 'high',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/inquiries?search=Oppenheimer');

        $response->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.name', 'Robert Oppenheimer');
    }

    public function test_can_filter_inquiries_by_status_and_priority(): void
    {
        Inquiry::create([
            'name' => 'Lead A',
            'email' => 'a@test.com',
            'subject' => 'Subject A',
            'message' => 'Detailed message A',
            'status' => 'won',
            'priority' => 'high',
        ]);

        Inquiry::create([
            'name' => 'Lead B',
            'email' => 'b@test.com',
            'subject' => 'Subject B',
            'message' => 'Detailed message B',
            'status' => 'pending',
            'priority' => 'low',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/inquiries?status=won&priority=high');

        $response->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.name', 'Lead A');
    }

    public function test_can_show_single_inquiry_with_relationships(): void
    {
        $inquiry = Inquiry::create([
            'name' => 'Lead Details',
            'email' => 'details@test.com',
            'subject' => 'Full Inspection',
            'message' => 'Message content for inspection',
            'status' => 'new',
            'priority' => 'normal',
            'assigned_to' => $this->agent->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/inquiries/{$inquiry->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $inquiry->id)
            ->assertJsonPath('data.assigned_user.id', $this->agent->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'reference_no',
                    'notes',
                    'reminders',
                    'attachments',
                    'activity_logs',
                ],
            ]);
    }

    public function test_can_update_inquiry_status_and_record_activity(): void
    {
        $inquiry = Inquiry::create([
            'name' => 'Status Lead',
            'email' => 'status@test.com',
            'subject' => 'Testing Status Flow',
            'message' => 'Message to be progressed',
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/inquiries/{$inquiry->id}/status", [
                'status' => 'contacted',
                'note' => 'Spoke over the phone, demo scheduled',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'contacted');

        $inquiry->refresh();
        $this->assertEquals('contacted', $inquiry->status);
        $this->assertNotNull($inquiry->last_contacted_at);

        // Verify activity log
        $this->assertDatabaseHas('inquiry_activity_logs', [
            'inquiry_id' => $inquiry->id,
            'action' => 'status_updated',
        ]);

        // Verify note created
        $this->assertDatabaseHas('inquiry_notes', [
            'inquiry_id' => $inquiry->id,
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_can_assign_inquiry_to_team_member(): void
    {
        $inquiry = Inquiry::create([
            'name' => 'Assignment Lead',
            'email' => 'assign@test.com',
            'subject' => 'Need Assignment',
            'message' => 'Will be assigned to agent',
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/inquiries/{$inquiry->id}/assign", [
                'assigned_to' => $this->agent->id,
            ]);

        $response->assertStatus(200);

        $inquiry->refresh();
        $this->assertEquals($this->agent->id, $inquiry->assigned_to);

        $this->assertDatabaseHas('inquiry_activity_logs', [
            'inquiry_id' => $inquiry->id,
            'action' => 'assigned',
        ]);
    }

    public function test_can_export_inquiries_to_csv(): void
    {
        Inquiry::create([
            'name' => 'CSV Lead',
            'email' => 'csv@test.com',
            'subject' => 'Export Check',
            'message' => 'Message inside CSV',
            'status' => 'new',
            'priority' => 'normal',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->get('/api/inquiries/export');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    public function test_agent_can_only_see_inquiries_assigned_to_them(): void
    {
        // Inquiry assigned to this agent
        $myInquiry = Inquiry::create([
            'name' => 'Agent Lead',
            'email' => 'agentlead@test.com',
            'subject' => 'For Jim Halpert',
            'message' => 'Lead meant for agent',
            'status' => 'new',
            'priority' => 'normal',
            'assigned_to' => $this->agent->id,
        ]);

        // Inquiry assigned to someone else
        $otherInquiry = Inquiry::create([
            'name' => 'Other Lead',
            'email' => 'otherlead@test.com',
            'subject' => 'For Admin Only',
            'message' => 'Lead meant for admin',
            'status' => 'new',
            'priority' => 'normal',
            'assigned_to' => $this->admin->id,
        ]);

        // Inquiry unassigned
        $unassignedInquiry = Inquiry::create([
            'name' => 'Unassigned Lead',
            'email' => 'unassigned@test.com',
            'subject' => 'Open pool',
            'message' => 'Lead in open pool',
            'status' => 'new',
            'priority' => 'normal',
            'assigned_to' => null,
        ]);

        $response = $this->actingAs($this->agent, 'sanctum')
            ->getJson('/api/inquiries');

        $response->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $myInquiry->id);
    }

    public function test_agent_cannot_reassign_inquiry(): void
    {
        $inquiry = Inquiry::create([
            'name' => 'Agent Lead',
            'email' => 'agentlead@test.com',
            'subject' => 'For Jim Halpert',
            'message' => 'Lead meant for agent',
            'status' => 'new',
            'priority' => 'normal',
            'assigned_to' => $this->agent->id,
        ]);

        $response = $this->actingAs($this->agent, 'sanctum')
            ->patchJson("/api/inquiries/{$inquiry->id}/assign", [
                'assigned_to' => $this->admin->id,
            ]);

        $response->assertStatus(403);
    }
}
