<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InquiryAttachmentsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Inquiry $inquiry;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->user = User::factory()->create([
            'role' => 'agent',
            'status' => 'active',
        ]);

        $this->inquiry = Inquiry::create([
            'name' => 'File Test Lead',
            'email' => 'files@test.com',
            'subject' => 'Attachments Needed',
            'message' => 'Inquiry with files test',
            'status' => 'new',
            'priority' => 'normal',
        ]);
    }

    public function test_can_upload_and_download_attachment(): void
    {
        $file = UploadedFile::fake()->create('contract_proposal.pdf', 300, 'application/pdf');

        $uploadRes = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/inquiries/{$this->inquiry->id}/attachments", [
                'file' => $file,
            ]);

        $uploadRes->assertStatus(201)
            ->assertJsonPath('data.original_filename', 'contract_proposal.pdf');

        $attachmentId = $uploadRes->json('data.id');

        // Download attachment
        $downloadRes = $this->actingAs($this->user, 'sanctum')
            ->get("/api/inquiries/{$this->inquiry->id}/attachments/{$attachmentId}/download");

        $downloadRes->assertStatus(200)
            ->assertHeader('Content-Disposition', 'attachment; filename=contract_proposal.pdf');

        // Delete attachment
        $deleteRes = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/inquiries/{$this->inquiry->id}/attachments/{$attachmentId}");

        $deleteRes->assertStatus(200);

        $this->assertDatabaseMissing('inquiry_attachments', ['id' => $attachmentId]);
    }
}
