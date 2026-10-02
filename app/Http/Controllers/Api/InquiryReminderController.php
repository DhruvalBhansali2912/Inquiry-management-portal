<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInquiryReminderRequest;
use App\Models\Inquiry;
use App\Models\InquiryActivityLog;
use App\Models\InquiryReminder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryReminderController extends Controller
{
    public function store(StoreInquiryReminderRequest $request, int $inquiryId): JsonResponse
    {
        $inquiry = Inquiry::findOrFail($inquiryId);
        $user = $request->user();

        $reminder = InquiryReminder::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'title' => $request->input('title'),
            'remind_at' => Carbon::parse($request->input('remind_at')),
            'status' => 'pending',
            'notes' => $request->input('notes'),
        ]);

        // Log Activity
        InquiryActivityLog::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'action' => 'reminder_created',
            'details' => [
                'title' => $reminder->title,
                'remind_at' => $reminder->remind_at->format('Y-m-d H:i'),
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reminder scheduled successfully',
            'data' => $reminder->load('user:id,name'),
        ], 201);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $reminder = InquiryReminder::with('inquiry')->findOrFail($id);
        $isCompleted = $reminder->status === 'completed';

        $reminder->status = $isCompleted ? 'pending' : 'completed';
        $reminder->completed_at = $isCompleted ? null : now();
        $reminder->save();

        InquiryActivityLog::create([
            'inquiry_id' => $reminder->inquiry_id,
            'user_id' => $request->user()->id,
            'action' => $reminder->status === 'completed' ? 'reminder_completed' : 'reminder_reopened',
            'details' => ['title' => $reminder->title],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Reminder updated',
            'data' => $reminder,
        ]);
    }

    public function upcoming(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = InquiryReminder::with(['inquiry:id,reference_no,name,subject,status', 'user:id,name'])
            ->where('status', 'pending');

        if (!$user->canManageInquiries()) {
            $query->where('user_id', $user->id);
        }

        $reminders = $query->orderBy('remind_at', 'asc')->limit(10)->get();

        return response()->json(['data' => $reminders]);
    }
}
