<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InquiryReceivedCustomerConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "We received your inquiry [Ref #{$this->inquiry->reference_no}]",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.inquiry_customer_confirmation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
