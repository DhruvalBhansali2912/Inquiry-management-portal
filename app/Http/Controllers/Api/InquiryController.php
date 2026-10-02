<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInquiryStatusRequest;
use App\Models\Inquiry;
use App\Models\InquiryActivityLog;
use App\Models\InquiryNote;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inquiry::query()
            ->with(['assignedUser:id,name,email,role'])
            ->withCount(['notes', 'reminders', 'attachments']);

        // Search
        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        // Filters
        if ($request->filled('status')) {
            $query->filterStatus($request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->filterPriority($request->input('priority'));
        }

        if ($request->filled('source')) {
            $query->filterSource($request->input('source'));
        }

        if ($request->filled('assigned_to')) {
            $query->filterAssigned($request->input('assigned_to'));
        }

        // Date range filters
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $allowedSorts = ['id', 'reference_no', 'name', 'email', 'status', 'priority', 'source', 'created_at', 'last_contacted_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        $direction = strtolower($request->input('order', 'desc')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $direction);

        $perPage = min((int) $request->input('per_page', 10), 100);
        $inquiries = $query->paginate($perPage);

        return response()->json($inquiries);
    }

    public function show(int $id): JsonResponse
    {
        $inquiry = Inquiry::with([
            'assignedUser:id,name,email,role,phone',
            'notes.user:id,name,role',
            'reminders.user:id,name',
            'attachments.user:id,name',
            'activityLogs.user:id,name',
        ])->findOrFail($id);

        return response()->json(['data' => $inquiry]);
    }

    public function updateStatus(UpdateInquiryStatusRequest $request, int $id): JsonResponse
    {
        $inquiry = Inquiry::findOrFail($id);
        $oldStatus = $inquiry->status;
        $newStatus = $request->input('status');
        $currentUser = $request->user();

        $inquiry->status = $newStatus;

        if ($newStatus === 'contacted' && empty($inquiry->last_contacted_at)) {
            $inquiry->last_contacted_at = now();
        }

        if (in_array($newStatus, ['won', 'lost'])) {
            $inquiry->resolved_at = now();
        }

        $inquiry->save();

        // If optional note provided with status change
        if ($request->filled('note')) {
            InquiryNote::create([
                'inquiry_id' => $inquiry->id,
                'user_id' => $currentUser->id,
                'type' => 'note',
                'content' => "Status changed to " . ucfirst($newStatus) . ": " . $request->input('note'),
                'is_internal' => true,
            ]);
        }

        // Log Activity
        InquiryActivityLog::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $currentUser->id,
            'action' => 'status_updated',
            'details' => [
                'from' => $oldStatus,
                'to' => $newStatus,
                'note' => $request->input('note'),
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => "Inquiry status updated to " . ucfirst($newStatus),
            'status' => $newStatus,
            'inquiry' => $inquiry->fresh(['assignedUser:id,name,email,role', 'activityLogs.user:id,name', 'notes.user:id,name,role']),
        ]);
    }

    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $inquiry = Inquiry::findOrFail($id);
        $newAssigneeId = $request->input('assigned_to');
        $assignedUser = $newAssigneeId ? User::find($newAssigneeId) : null;

        $inquiry->assigned_to = $newAssigneeId;
        $inquiry->save();

        // Log Activity
        InquiryActivityLog::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $request->user()->id,
            'action' => 'assigned',
            'details' => [
                'assigned_to_id' => $newAssigneeId,
                'assigned_to_name' => $assignedUser ? $assignedUser->name : 'Unassigned',
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => $assignedUser ? "Inquiry assigned to {$assignedUser->name}" : 'Inquiry unassigned',
            'inquiry' => $inquiry->fresh(['assignedUser:id,name,email,role', 'activityLogs.user:id,name']),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->canManageInquiries()) {
            return response()->json(['message' => 'Unauthorized. Only admins and managers can delete inquiries.'], 403);
        }

        $inquiry = Inquiry::findOrFail($id);
        $inquiry->delete();

        return response()->json(['message' => 'Inquiry deleted successfully']);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Inquiry::query()->with('assignedUser:id,name');

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }
        if ($request->filled('status')) {
            $query->filterStatus($request->input('status'));
        }
        if ($request->filled('priority')) {
            $query->filterPriority($request->input('priority'));
        }
        if ($request->filled('source')) {
            $query->filterSource($request->input('source'));
        }
        if ($request->filled('assigned_to')) {
            $query->filterAssigned($request->input('assigned_to'));
        }

        $filename = 'inquiries_export_' . date('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'Reference ID',
                'Status',
                'Priority',
                'Customer Name',
                'Email',
                'Phone',
                'Company',
                'Subject',
                'Message',
                'Source',
                'Campaign Tag',
                'Assigned Staff',
                'Created At',
                'Last Contacted At',
                'Resolved At',
            ]);

            $query->chunk(200, function ($inquiries) use ($handle) {
                foreach ($inquiries as $inq) {
                    fputcsv($handle, [
                        $inq->reference_no,
                        strtoupper($inq->status),
                        strtoupper($inq->priority),
                        $inq->name,
                        $inq->email,
                        $inq->phone ?: 'N/A',
                        $inq->company ?: 'N/A',
                        $inq->subject,
                        str_replace(["\r", "\n"], ' ', $inq->message),
                        $inq->source,
                        $inq->campaign_tag ?: 'N/A',
                        $inq->assignedUser ? $inq->assignedUser->name : 'Unassigned',
                        $inq->created_at ? $inq->created_at->format('Y-m-d H:i') : '',
                        $inq->last_contacted_at ? $inq->last_contacted_at->format('Y-m-d H:i') : '',
                        $inq->resolved_at ? $inq->resolved_at->format('Y-m-d H:i') : '',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
