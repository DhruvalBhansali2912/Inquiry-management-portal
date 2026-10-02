<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InquiryReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'inquiry_id',
        'user_id',
        'title',
        'remind_at',
        'status',
        'notes',
        'completed_at',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
