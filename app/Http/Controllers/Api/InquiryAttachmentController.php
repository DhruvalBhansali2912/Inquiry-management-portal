<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\InquiryActivityLog;
use App\Models\InquiryAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InquiryAttachmentController extends Controller
{
    public function store(Request $request, int $inquiryId): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:15360', 'mimes:pdf,doc,docx,txt,png,jpg,jpeg,webp,zip,csv,xlsx'],
        ]);

        $inquiry = Inquiry::findOrFail($inquiryId);
        $user = $request->user();
        $file = $request->file('file');

        $originalName = $file->getClientOriginalName();
        $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('inquiry_attachments/' . $inquiry->id, $storedName, 'local');

        $attachment = InquiryAttachment::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'original_filename' => $originalName,
            'stored_filename' => $storedName,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
        ]);

        InquiryActivityLog::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'action' => 'file_uploaded',
            'details' => [
                'filename' => $originalName,
                'size' => $attachment->formatted_size,
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Attachment uploaded successfully',
            'data' => $attachment->load('user:id,name'),
        ], 201);
    }

    public function download(Request $request, int $inquiryId, int $attachmentId): BinaryFileResponse|JsonResponse
    {
        $user = $request->user();

        // If not authenticated via header, check for token query parameter
        if (!$user && $request->filled('token')) {
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($request->query('token'));
            if ($tokenModel && $tokenModel->tokenable) {
                $user = $tokenModel->tokenable;
            }
        }

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $attachment = InquiryAttachment::where('inquiry_id', $inquiryId)->findOrFail($attachmentId);

        if (!Storage::disk('local')->exists($attachment->file_path)) {
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        $fullPath = Storage::disk('local')->path($attachment->file_path);

        return response()->download($fullPath, $attachment->original_filename, [
            'Content-Type' => $attachment->mime_type,
        ]);
    }

    public function destroy(Request $request, int $inquiryId, int $attachmentId): JsonResponse
    {
        $user = $request->user();
        $attachment = InquiryAttachment::where('inquiry_id', $inquiryId)->findOrFail($attachmentId);

        if ($attachment->user_id !== $user->id && !$user->canManageInquiries()) {
            return response()->json(['message' => 'Unauthorized to delete this attachment.'], 403);
        }

        if (Storage::disk('local')->exists($attachment->file_path)) {
            Storage::disk('local')->delete($attachment->file_path);
        }

        $attachment->delete();

        return response()->json(['message' => 'Attachment removed']);
    }
}
