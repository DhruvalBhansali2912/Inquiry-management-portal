<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:3', 'max:5000'],
            'type' => ['nullable', 'string', 'in:note,call_log,email_log,meeting'],
            'is_internal' => ['nullable', 'boolean'],
        ];
    }
}
