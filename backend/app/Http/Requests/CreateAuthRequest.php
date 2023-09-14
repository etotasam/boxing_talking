<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAuthRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:30'
            ],
            'email' => [
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'regex:/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,24}$/'
            ]
        ];
    }



    public function messages()
    {
        return [
            'name.required' => 'name is required',
            'name.max' => 'name is too long',
        ];
    }
}
