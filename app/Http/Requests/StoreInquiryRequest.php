<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc,filter', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'source' => ['nullable', 'string', 'in:website,campaign,google_ads,linkedin,referral,other'],
            'campaign_tag' => ['nullable', 'string', 'max:100'],
            'priority' => ['nullable', 'string', 'in:low,normal,high,urgent'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,txt,png,jpg,jpeg,webp,zip'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your full name.',
            'email.required' => 'A valid email address is required.',
            'subject.required' => 'Please specify what your inquiry is about.',
            'message.required' => 'Please enter your message or question.',
            'message.min' => 'Your message should be at least 10 characters long.',
            'attachments.*.max' => 'Each attached file must not exceed 10MB.',
            'attachments.*.mimes' => 'Allowed file types are PDF, DOC, DOCX, TXT, images (PNG, JPG, WEBP), and ZIP.',
        ];
    }
}
