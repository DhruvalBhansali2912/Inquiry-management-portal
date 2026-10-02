<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInquiryNoteRequest;
use App\Models\Inquiry;
use App\Models\InquiryActivityLog;
use App\Models\InquiryNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryNoteController extends Controller
{
    public function store(StoreInquiryNoteRequest $request, int $inquiryId): JsonResponse
    {
        $inquiry = Inquiry::findOrFail($inquiryId);
        $user = $request->user();

        $note = InquiryNote::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'type' => $request->input('type', 'note'),
            'content' => $request->input('content'),
            'is_internal' => $request->boolean('is_internal', true),
        ]);

        // Log Activity
        InquiryActivityLog::create([
            'inquiry_id' => $inquiry->id,
            'user_id' => $user->id,
            'action' => 'note_added',
            'details' => [
                'type' => $note->type,
                'preview' => mb_substr($note->content, 0, 80) . (mb_strlen($note->content) > 80 ? '...' : ''),
            ],
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Note added successfully',
            'data' => $note->load('user:id,name,role'),
        ], 201);
    }

    public function destroy(Request $request, int $inquiryId, int $noteId): JsonResponse
    {
        $user = $request->user();
        $note = InquiryNote::where('inquiry_id', $inquiryId)->findOrFail($noteId);

        // Only author or admin/manager can delete
        if ($note->user_id !== $user->id && !$user->canManageInquiries()) {
            return response()->json(['message' => 'Unauthorized to delete this note.'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }
}
