<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_calculate_dashboard_metrics_accurately(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create 2 new, 1 contacted, 2 won, 1 lost
        Inquiry::create(['name' => 'Lead 1', 'email' => '1@test.com', 'subject' => 'S1', 'message' => 'Msg 1', 'status' => 'new', 'source' => 'website']);
        Inquiry::create(['name' => 'Lead 2', 'email' => '2@test.com', 'subject' => 'S2', 'message' => 'Msg 2', 'status' => 'new', 'source' => 'google_ads']);
        Inquiry::create(['name' => 'Lead 3', 'email' => '3@test.com', 'subject' => 'S3', 'message' => 'Msg 3', 'status' => 'contacted', 'source' => 'website']);
        Inquiry::create(['name' => 'Lead 4', 'email' => '4@test.com', 'subject' => 'S4', 'message' => 'Msg 4', 'status' => 'won', 'source' => 'referral']);
        Inquiry::create(['name' => 'Lead 5', 'email' => '5@test.com', 'subject' => 'S5', 'message' => 'Msg 5', 'status' => 'won', 'source' => 'linkedin']);
        Inquiry::create(['name' => 'Lead 6', 'email' => '6@test.com', 'subject' => 'S6', 'message' => 'Msg 6', 'status' => 'lost', 'source' => 'other']);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200);

        $metrics = $response->json('metrics');

        // Total: 6
        $this->assertEquals(6, $metrics['total']);
        // Open (new: 2 + contacted: 1 + qualified: 0 + pending: 0) = 3
        $this->assertEquals(3, $metrics['open']);
        // Closed (won: 2 + lost: 1) = 3
        $this->assertEquals(3, $metrics['closed']);
        // Won: 2
        $this->assertEquals(2, $metrics['won']);
        // Conversion rate: 2 / 3 = 66.7%
        $this->assertEquals(66.7, $metrics['conversion_rate']);

        // Check grouped sources
        $sources = $response->json('by_source');
        $this->assertEquals(2, $sources['website']);
        $this->assertEquals(1, $sources['google_ads']);
        $this->assertEquals(1, $sources['referral']);
        $this->assertEquals(1, $sources['linkedin']);
        $this->assertEquals(1, $sources['other']);
    }
}
