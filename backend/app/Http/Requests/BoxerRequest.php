<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BoxerRequest extends FormRequest
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
            'name' => 'required|unique:boxers,name',
            'eng_name' => 'required|unique:boxers,eng_name'
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'name is required',
            'name.unique' => 'name is already exists',

            'eng_name.required' => 'eng_name is required',
            'eng_name.unique' => 'eng_name is already exists',
        ];
    }
}
