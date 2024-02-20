<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BoxingMatchesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'update_match_data.venue' => ['string', 'max:20']

        ];
    }


    public function messages()
    {
        return [
            'max:20' => 'venue is max 20 chars',
        ];
    }
}
