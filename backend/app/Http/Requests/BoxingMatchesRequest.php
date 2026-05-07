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
            'match_id' => ['integer'],
            'match_date' => ['date'],
            'red_boxer_id' => ['integer'],
            'blue_boxer_id' => ['integer'],
            'grade' => ['string'],
            'country' => ['string'],
            'venue' => ['string', 'max:20'],
            'weight' => ['string'],
            'titles' => ['array'],
            'titles.*' => ['string'],
        ];
    }


    public function messages()
    {
        return [
            'venue.max' => 'venue is max 20 chars',
        ];
    }

    /**
     * 更新対象の試合データを返す
     */
    public function validatedUpdateData(): array
    {
        $data = $this->validated();
        unset($data['match_id']);

        return $data;
    }

    /**
     * バリデーションエラーに対応する独自エラーコードを返す
     */
    protected function validationErrorCode(Validator $validator): int|false
    {
        $failedRules = $validator->failed();

        if (isset($failedRules['venue']['Max'])) {
            return CustomErrorCodes::MATCH_VENUE_TOO_LONG;
        }

        return false;
    }
}
