<?php

namespace App\Http\Requests;

use App\Constants\HttpStatusCodes;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class ApiRequest extends FormRequest
{
    protected function failedValidation(Validator $validator)
    {
        $response = response()->json([
            'success'  => false,
            'message'  => $validator->errors(),
        ], HttpStatusCodes::UNPROCESSABLE_ENTITY);

        throw new HttpResponseException($response);
    }
}
