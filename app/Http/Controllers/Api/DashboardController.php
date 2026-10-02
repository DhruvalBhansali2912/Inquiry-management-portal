<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\InquiryReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();

        $inquiryQuery = Inquiry::query();
        if ($user->isAgent()) {
            $inquiryQuery->where('assigned_to', $user->id);
        }

        // 1. Grouped counts by status using an optimized single query
        $statusCounts = (clone $inquiryQuery)->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $totalInquiries = array_sum($statusCounts);
        $newCount = $statusCounts['new'] ?? 0;
        $contactedCount = $statusCounts['contacted'] ?? 0;
        $qualifiedCount = $statusCounts['qualified'] ?? 0;
        $pendingCount = $statusCounts['pending'] ?? 0;
        $wonCount = $statusCounts['won'] ?? 0;
        $lostCount = $statusCounts['lost'] ?? 0;

        $openInquiries = $newCount + $contactedCount + $qualifiedCount + $pendingCount;
        $closedInquiries = $wonCount + $lostCount;
        $conversionRate = $closedInquiries > 0 ? round(($wonCount / $closedInquiries) * 100, 1) : 0;

        // 2. Grouped counts by source
        $sourceCounts = (clone $inquiryQuery)->select('source', DB::raw('count(*) as total'))
            ->groupBy('source')
            ->pluck('total', 'source')
            ->toArray();

        // 3. Grouped counts by priority
        $priorityCounts = (clone $inquiryQuery)->select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->pluck('total', 'priority')
            ->toArray();

        // 4. Recent inquiries
        $recentInquiries = (clone $inquiryQuery)->with('assignedUser:id,name,role')
            ->latest()
            ->limit(5)
            ->get(['id', 'reference_no', 'name', 'email', 'subject', 'status', 'priority', 'source', 'assigned_to', 'created_at']);

        // 5. Upcoming Reminders
        $reminderQuery = InquiryReminder::with(['inquiry:id,reference_no,name,subject', 'user:id,name'])
            ->where('status', 'pending');
        
        if (!$user->canManageInquiries()) {
            $reminderQuery->where('user_id', $user->id);
        }

        $upcomingReminders = $reminderQuery->orderBy('remind_at', 'asc')->limit(5)->get();
        $pendingRemindersCount = InquiryReminder::where('status', 'pending')->count();

        return response()->json([
            'metrics' => [
                'total' => $totalInquiries,
                'open' => $openInquiries,
                'closed' => $closedInquiries,
                'new' => $newCount,
                'contacted' => $contactedCount,
                'qualified' => $qualifiedCount,
                'pending' => $pendingCount,
                'won' => $wonCount,
                'lost' => $lostCount,
                'conversion_rate' => $conversionRate,
                'pending_reminders' => $pendingRemindersCount,
            ],
            'by_status' => $statusCounts,
            'by_source' => $sourceCounts,
            'by_priority' => $priorityCounts,
            'recent_inquiries' => $recentInquiries,
            'upcoming_reminders' => $upcomingReminders,
        ]);
    }
}
