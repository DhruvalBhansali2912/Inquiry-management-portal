<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInquiryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:new,contacted,qualified,won,lost,pending'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
