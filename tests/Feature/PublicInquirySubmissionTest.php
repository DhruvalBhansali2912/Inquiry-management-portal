<?php

namespace Tests\Feature;

use App\Mail\InquiryReceivedCustomerConfirmation;
use App\Mail\NewInquiryAdminNotification;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicInquirySubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_submit_valid_public_inquiry(): void
    {
        Mail::fake();

        // Create an active sales agent for auto-assignment
        $agent = User::factory()->create([
            'role' => 'agent',
            'status' => 'active',
        ]);

        $payload = [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+1 555-0123',
            'company' => 'Acme Corporation',
            'subject' => 'Need Enterprise VPS Cloud Setup',
            'message' => 'We require a scalable web infrastructure on AlmaLinux with CI/CD deployment.',
            'source' => 'google_ads',
            'campaign_tag' => 'vps-promo-2026',
            'priority' => 'high',
        ];

        $response = $this->postJson('/api/inquiries', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'reference_no',
                'inquiry' => [
                    'id',
                    'reference_no',
                    'name',
                    'email',
                    'subject',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('inquiries', [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'source' => 'google_ads',
            'campaign_tag' => 'vps-promo-2026',
            'priority' => 'high',
            'status' => 'new',
            'assigned_to' => $agent->id,
        ]);

        $inquiry = Inquiry::where('email', 'john.doe@example.com')->first();
        $this->assertNotNull($inquiry->reference_no);
        $this->assertStringStartsWith('INQ-', $inquiry->reference_no);

        // Verify activity log was created
        $this->assertDatabaseHas('inquiry_activity_logs', [
            'inquiry_id' => $inquiry->id,
            'action' => 'created',
        ]);

        // Verify emails were sent
        Mail::assertSent(InquiryReceivedCustomerConfirmation::class);
        Mail::assertSent(NewInquiryAdminNotification::class);
    }

    public function test_validates_required_fields_on_submission(): void
    {
        $response = $this->postJson('/api/inquiries', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
    }

    public function test_validates_message_minimum_length(): void
    {
        $response = $this->postJson('/api/inquiries', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Short msg test',
            'message' => 'Too short', // 9 characters
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_can_upload_attachments_with_inquiry_submission(): void
    {
        Mail::fake();
        Storage::fake('local');

        $file = UploadedFile::fake()->create('project_spec.pdf', 500, 'application/pdf');

        $payload = [
            'name' => 'Alice Tech',
            'email' => 'alice@techcorp.io',
            'subject' => 'Spec Sheet Attached',
            'message' => 'Please find attached the complete specifications for our inquiry.',
            'source' => 'website',
            'attachments' => [$file],
        ];

        $response = $this->postJson('/api/inquiries', $payload);

        $response->assertStatus(201);

        $inquiry = Inquiry::where('email', 'alice@techcorp.io')->first();
        $this->assertNotNull($inquiry);

        $this->assertDatabaseHas('inquiry_attachments', [
            'inquiry_id' => $inquiry->id,
            'original_filename' => 'project_spec.pdf',
        ]);
    }
}
