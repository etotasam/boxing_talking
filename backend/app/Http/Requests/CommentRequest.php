<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiRequest;

class CommentRequest extends ApiRequest
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
            'comment' => [
                'required',
                'string',
                'max:1000',
            ],
            'match_id' => [
                'required'
            ]
        ];
    }


    public function messages()
    {
        return [
            'comment.required' => 'comment is require',
            'comment.max' => 'comment is too long',
            'match_id.required' => 'match_id is require',
        ];
    }
}
