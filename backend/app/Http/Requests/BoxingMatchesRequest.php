<?php

namespace App\Http\Requests;

use App\Exceptions\CustomErrorCodes;
use Illuminate\Contracts\Validation\Validator;

class BoxingMatchesRequest extends ApiRequest
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
            'venue' => ['string', 'max:20'],
            'update_match_data.venue' => ['string', 'max:20']

        ];
    }


    public function messages()
    {
        return [
            'venue.max' => 'venue is max 20 chars',
            'update_match_data.venue.max' => 'venue is max 20 chars',
        ];
    }

    /**
     * バリデーションエラーに対応する独自エラーコードを返す
     */
    protected function validationErrorCode(Validator $validator): int|false
    {
        $failedRules = $validator->failed();

        if (isset($failedRules['venue']['Max']) || isset($failedRules['update_match_data.venue']['Max'])) {
            return CustomErrorCodes::MATCH_VENUE_TOO_LONG;
        }

        return false;
    }
}
