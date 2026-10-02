<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewInquiryAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[New Inquiry #{$this->inquiry->reference_no}] {$this->inquiry->subject}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.inquiry_admin_notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
