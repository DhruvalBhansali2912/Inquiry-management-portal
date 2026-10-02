<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInquiryRequest;
use App\Mail\InquiryReceivedCustomerConfirmation;
use App\Mail\NewInquiryAdminNotification;
use App\Models\Inquiry;
use App\Models\InquiryActivityLog;
use App\Models\InquiryAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PublicInquiryController extends Controller
{
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Auto assignment logic (round-robin among active agents/managers)
        $assignedUser = null;
        $activeStaff = User::where('status', 'active')
            ->whereIn('role', ['agent', 'manager'])
            ->withCount('assignedInquiries')
            ->orderBy('assigned_inquiries_count', 'asc')
            ->first();

        if ($activeStaff) {
            $assignedUser = $activeStaff->id;
        }

        // 2. Create Inquiry
        $inquiry = new Inquiry();
        $inquiry->name = $validated['name'];
        $inquiry->email = $validated['email'];
        $inquiry->phone = $validated['phone'] ?? null;
        $inquiry->company = $validated['company'] ?? null;
        $inquiry->subject = $validated['subject'];
        $inquiry->message = $validated['message'];
        $inquiry->source = $validated['source'] ?? 'website';
        $inquiry->campaign_tag = $validated['campaign_tag'] ?? null;
        $inquiry->priority = $validated['priority'] ?? 'normal';
        $inquiry->status = 'new';
        $inquiry->assigned_to = $assignedUser;
        $inquiry->ip_address = $request->ip();
        $inquiry->user_agent = $request->userAgent();
        $inquiry->save();

        // 3. Handle File Attachments if uploaded
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                if ($file->isValid()) {
                    $originalName = $file->getClientOriginalName();
                    $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('inquiry_attachments/' . $inquiry->id, $storedName, 'local');

                    InquiryAttachment::create([
                        'inquiry_id' => $inquiry->id,
                        'user_id' => null, // public submission
                        'original_filename' => $originalName,
                        'stored_filename' => $storedName,
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
                    ]);
                }
            }
        }

        // 4. Log Activity
        InquiryActivityLog::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => null,
            'action' => 'created',
            'details' => [
                'source' => $inquiry->source,
                'campaign_tag' => $inquiry->campaign_tag,
                'assigned_to' => $activeStaff ? $activeStaff->name : 'Unassigned',
                'ip' => $inquiry->ip_address,
            ],
            'created_at' => now(),
        ]);

        // 5. Send Email Notifications (Graceful fail if SMTP not configured)
        try {
            // Customer Confirmation
            if (!empty($inquiry->email)) {
                Mail::to($inquiry->email)->send(new InquiryReceivedCustomerConfirmation($inquiry));
            }

            // Admin / Staff Alert
            $adminEmail = config('mail.from.address') ?: 'admin@inquiry.local';
            if ($activeStaff && !empty($activeStaff->email)) {
                $adminEmail = $activeStaff->email;
            }
            Mail::to($adminEmail)->send(new NewInquiryAdminNotification($inquiry));
        } catch (\Throwable $e) {
            Log::warning('Email notification failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Thank you! Your inquiry has been submitted successfully.',
            'reference_no' => $inquiry->reference_no,
            'inquiry' => [
                'id' => $inquiry->id,
                'reference_no' => $inquiry->reference_no,
                'name' => $inquiry->name,
                'email' => $inquiry->email,
                'subject' => $inquiry->subject,
                'created_at' => $inquiry->created_at->toIso8601String(),
            ],
        ], 201);
    }
}
