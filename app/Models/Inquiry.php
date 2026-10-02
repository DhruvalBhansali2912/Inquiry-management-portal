<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inquiry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference_no',
        'name',
        'email',
        'phone',
        'company',
        'subject',
        'message',
        'source',
        'campaign_tag',
        'status',
        'priority',
        'assigned_to',
        'ip_address',
        'user_agent',
        'last_contacted_at',
        'resolved_at',
    ];

    protected $casts = [
        'last_contacted_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Inquiry $inquiry) {
            if (empty($inquiry->reference_no)) {
                $year = date('Y');
                $random = strtoupper(substr(uniqid(), -5));
                $inquiry->reference_no = "INQ-{$year}-{$random}";
            }
        });
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(InquiryNote::class)->latest();
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(InquiryReminder::class)->orderBy('remind_at', 'asc');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InquiryAttachment::class)->latest();
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(InquiryActivityLog::class)->latest('id');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
              ->orWhere('company', 'like', "%{$term}%")
              ->orWhere('subject', 'like', "%{$term}%")
              ->orWhere('reference_no', 'like', "%{$term}%");
        });
    }

    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        if (!empty($status) && $status !== 'all') {
            return $query->where('status', $status);
        }
        return $query;
    }

    public function scopeFilterPriority(Builder $query, ?string $priority): Builder
    {
        if (!empty($priority) && $priority !== 'all') {
            return $query->where('priority', $priority);
        }
        return $query;
    }

    public function scopeFilterSource(Builder $query, ?string $source): Builder
    {
        if (!empty($source) && $source !== 'all') {
            return $query->where('source', $source);
        }
        return $query;
    }

    public function scopeFilterAssigned(Builder $query, $userId): Builder
    {
        if (!empty($userId) && $userId !== 'all') {
            if ($userId === 'unassigned') {
                return $query->whereNull('assigned_to');
            }
            return $query->where('assigned_to', $userId);
        }
        return $query;
    }
}
