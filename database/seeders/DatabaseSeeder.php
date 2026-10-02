<?php

namespace Database\Seeders;

use App\Models\Inquiry;
use App\Models\InquiryActivityLog;
use App\Models\InquiryNote;
use App\Models\InquiryReminder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Core Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@inquiry.local'],
            [
                'name' => 'Sarah Connor (Admin)',
                'password' => Hash::make('Password123!'),
                'role' => 'admin',
                'status' => 'active',
                'phone' => '+1 (555) 019-2834',
                'email_verified_at' => now(),
            ]
        );

        $manager = User::firstOrCreate(
            ['email' => 'manager@inquiry.local'],
            [
                'name' => 'Michael Scott (Manager)',
                'password' => Hash::make('Password123!'),
                'role' => 'manager',
                'status' => 'active',
                'phone' => '+1 (555) 014-9988',
                'email_verified_at' => now(),
            ]
        );

        $agent = User::firstOrCreate(
            ['email' => 'agent@inquiry.local'],
            [
                'name' => 'Jim Halpert (Agent)',
                'password' => Hash::make('Password123!'),
                'role' => 'agent',
                'status' => 'active',
                'phone' => '+1 (555) 012-3456',
                'email_verified_at' => now(),
            ]
        );

        // 2. Create Sample Inquiries if none exist
        if (Inquiry::count() === 0) {
            $inquiriesData = [
                [
                    'reference_no' => 'INQ-2026-90101',
                    'name' => 'David Miller',
                    'email' => 'david.miller@apextech.io',
                    'phone' => '+1 (415) 555-8291',
                    'company' => 'Apex Technology Solutions',
                    'subject' => 'Enterprise Cloud Migration & Architecture Audit',
                    'message' => 'Hello, we are planning to migrate our legacy monolithic workload to a scalable VPS and Kubernetes setup on Linux. Looking for an experienced team to conduct an architecture review and provide an implementation roadmap within Q4.',
                    'source' => 'google_ads',
                    'campaign_tag' => 'cloud-promo-2026',
                    'status' => 'new',
                    'priority' => 'high',
                    'assigned_to' => $admin->id,
                    'ip_address' => '192.168.1.10',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    'created_at' => Carbon::now()->subHours(2),
                ],
                [
                    'reference_no' => 'INQ-2026-80204',
                    'name' => 'Emma Watson',
                    'email' => 'emma.w@luminahealth.com',
                    'phone' => '+1 (212) 555-4920',
                    'company' => 'Lumina Healthcare Systems',
                    'subject' => 'Custom Patient Portal & HIPAA Compliant CRM',
                    'message' => 'We need a tailored patient inquiry and appointment follow-up system with automated notifications and audit logging. Can you send over your portfolio and typical turnaround times?',
                    'source' => 'website',
                    'campaign_tag' => null,
                    'status' => 'contacted',
                    'priority' => 'urgent',
                    'assigned_to' => $agent->id,
                    'ip_address' => '104.28.19.45',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'last_contacted_at' => Carbon::now()->subHours(6),
                    'created_at' => Carbon::now()->subDays(1),
                ],
                [
                    'reference_no' => 'INQ-2026-70305',
                    'name' => 'Robert Chen',
                    'email' => 'rchen@novaretail.com',
                    'phone' => '+1 (312) 555-7711',
                    'company' => 'Nova Retail Partners',
                    'subject' => 'Omnichannel Lead Capture Integration',
                    'message' => 'Looking to unify incoming inquiries across our e-commerce landing pages, social campaigns, and offline stores into one centralized operations dashboard.',
                    'source' => 'campaign',
                    'campaign_tag' => 'spring-retail-summit',
                    'status' => 'qualified',
                    'priority' => 'normal',
                    'assigned_to' => $manager->id,
                    'ip_address' => '67.180.22.14',
                    'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
                    'last_contacted_at' => Carbon::now()->subDays(2),
                    'created_at' => Carbon::now()->subDays(3),
                ],
                [
                    'reference_no' => 'INQ-2026-60408',
                    'name' => 'Sophia Rodriguez',
                    'email' => 'sophia@vanguardfintech.com',
                    'phone' => '+1 (305) 555-1199',
                    'company' => 'Vanguard Fintech Group',
                    'subject' => 'Annual Retainer for DevOps & CI/CD Pipelines',
                    'message' => 'Proposal reviewed and approved by management. Ready to execute contract for dedicated DevOps and server deployment support.',
                    'source' => 'referral',
                    'campaign_tag' => null,
                    'status' => 'won',
                    'priority' => 'high',
                    'assigned_to' => $admin->id,
                    'ip_address' => '172.56.21.90',
                    'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
                    'last_contacted_at' => Carbon::now()->subDays(1),
                    'resolved_at' => Carbon::now()->subHours(4),
                    'created_at' => Carbon::now()->subDays(7),
                ],
                [
                    'reference_no' => 'INQ-2026-50512',
                    'name' => 'Alex Turner',
                    'email' => 'alex@bluehorizonlogistics.com',
                    'phone' => '+1 (206) 555-9012',
                    'company' => 'Blue Horizon Logistics',
                    'subject' => 'Warehouse Fleet Tracking Quote Request',
                    'message' => 'Looking for pricing details on GPS integration and lead intake for our freight operators.',
                    'source' => 'linkedin',
                    'campaign_tag' => 'li-b2b-leadgen',
                    'status' => 'pending',
                    'priority' => 'low',
                    'assigned_to' => $agent->id,
                    'ip_address' => '72.14.201.2',
                    'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
                    'created_at' => Carbon::now()->subDays(4),
                ],
                [
                    'reference_no' => 'INQ-2026-40615',
                    'name' => 'Marcus Vance',
                    'email' => 'mvance@zenithventures.co',
                    'phone' => '+1 (617) 555-3401',
                    'company' => 'Zenith Ventures',
                    'subject' => 'Seed Round Pitch Deck Inquiry',
                    'message' => 'Unfortunately selected a different internal tool that matches our existing ERP better. May reconsider next year.',
                    'source' => 'other',
                    'campaign_tag' => null,
                    'status' => 'lost',
                    'priority' => 'low',
                    'assigned_to' => $manager->id,
                    'ip_address' => '98.210.45.12',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'resolved_at' => Carbon::now()->subDays(2),
                    'created_at' => Carbon::now()->subDays(10),
                ],
            ];

            foreach ($inquiriesData as $data) {
                $inquiry = Inquiry::create($data);

                // Add Activity Log
                InquiryActivityLog::create([
                    'inquiry_id' => $inquiry->id,
                    'user_id' => null,
                    'action' => 'created',
                    'details' => [
                        'source' => $inquiry->source,
                        'campaign' => $inquiry->campaign_tag,
                        'ip' => $inquiry->ip_address,
                    ],
                    'created_at' => $inquiry->created_at,
                ]);

                // Add Notes & Reminders for select inquiries
                if ($inquiry->status === 'contacted') {
                    InquiryNote::create([
                        'inquiry_id' => $inquiry->id,
                        'user_id' => $agent->id,
                        'type' => 'call_log',
                        'content' => 'Spoke with Emma on the phone. Very interested in our security features. Sending HIPAA whitepaper and technical overview.',
                        'is_internal' => true,
                        'created_at' => Carbon::now()->subHours(5),
                    ]);

                    InquiryReminder::create([
                        'inquiry_id' => $inquiry->id,
                        'user_id' => $agent->id,
                        'title' => 'Follow up on HIPAA proposal & schedule demo call',
                        'remind_at' => Carbon::now()->addDay()->setHour(14)->setMinute(0),
                        'status' => 'pending',
                        'notes' => 'Have product demo deck ready.',
                    ]);
                }

                if ($inquiry->status === 'qualified') {
                    InquiryNote::create([
                        'inquiry_id' => $inquiry->id,
                        'user_id' => $manager->id,
                        'type' => 'meeting',
                        'content' => 'Discovery call completed. Budget approved: $15k - $25k. Scope includes 3 landing page webhooks and real-time dashboard.',
                        'is_internal' => true,
                        'created_at' => Carbon::now()->subDays(2),
                    ]);

                    InquiryReminder::create([
                        'inquiry_id' => $inquiry->id,
                        'user_id' => $manager->id,
                        'title' => 'Send formal statement of work (SOW)',
                        'remind_at' => Carbon::now()->addHours(6),
                        'status' => 'pending',
                    ]);
                }

                if ($inquiry->status === 'won') {
                    InquiryNote::create([
                        'inquiry_id' => $inquiry->id,
                        'user_id' => $admin->id,
                        'type' => 'note',
                        'content' => 'Deal closed! Contract executed for 12 months retainer support. Handing off to technical onboarding team.',
                        'is_internal' => true,
                        'created_at' => Carbon::now()->subHours(4),
                    ]);
                }
            }
        }
    }
}
