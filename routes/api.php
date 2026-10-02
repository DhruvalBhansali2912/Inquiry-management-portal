<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InquiryAttachmentController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\InquiryNoteController;
use App\Http\Controllers\Api\InquiryReminderController;
use App\Http\Controllers\Api\PublicInquiryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
// 1. Public Inquiry Form Submission
Route::post('/inquiries', [PublicInquiryController::class, 'store']);

// 2. Staff Authentication
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Admin & Staff Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Current user profile & logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/team', [AuthController::class, 'team']);

    // Dashboard metrics
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

    // Reminders
    Route::get('/reminders/upcoming', [InquiryReminderController::class, 'upcoming']);
    Route::patch('/reminders/{id}/toggle', [InquiryReminderController::class, 'toggle']);

    // Inquiries management
    Route::get('/inquiries/export', [InquiryController::class, 'export']);
    Route::get('/inquiries', [InquiryController::class, 'index']);
    Route::get('/inquiries/{id}', [InquiryController::class, 'show']);
    Route::patch('/inquiries/{id}/status', [InquiryController::class, 'updateStatus']);
    Route::patch('/inquiries/{id}/assign', [InquiryController::class, 'assign']);
    Route::delete('/inquiries/{id}', [InquiryController::class, 'destroy']);

    // Notes
    Route::post('/inquiries/{id}/notes', [InquiryNoteController::class, 'store']);
    Route::delete('/inquiries/{inquiryId}/notes/{noteId}', [InquiryNoteController::class, 'destroy']);

    // Reminders
    Route::post('/inquiries/{id}/reminders', [InquiryReminderController::class, 'store']);

    // Attachments
    Route::post('/inquiries/{id}/attachments', [InquiryAttachmentController::class, 'store']);
    Route::delete('/inquiries/{id}/attachments/{attachmentId}', [InquiryAttachmentController::class, 'destroy']);
});

// Download Attachment (Supports both Sanctum Bearer header and ?token= query parameter)
Route::get('/inquiries/{id}/attachments/{attachmentId}/download', [InquiryAttachmentController::class, 'download']);

