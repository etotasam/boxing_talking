<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PreCreateAuthRequest extends FormRequest
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
                'max:30',
                'min:3',
                'unique:users,name',
                'unique:pre_users,name',
            ],
            'email' => [
                'required',
                'email',
                'unique:users,email',
                'unique:pre_users,email'
            ],
            'password' => [
                'regex: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\-]{8,24}$/'
            ]
        ];
    }



    public function messages()
    {
        return [
            'name.required' => 'name is required',
            'name.max' => 'name is too long',
            'name.unique' => "name is already used",

            'email.required' => "email is required",
            'email.unique' => "email is already exists",
        ];
    }
}
