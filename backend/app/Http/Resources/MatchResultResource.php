<?php

namespace App\Http\Resources;

use App\Models\MatchResult;
use App\Models\BoxingMatch;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchResultResource extends JsonResource
{

    public function __construct(private MatchResult $matchResult)
    {
        parent::__construct($matchResult);
    }


    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            "result" => $this->matchResult->match_result,
            "detail" => $this->matchResult->detail,
            "round" => $this->matchResult->round,
        ];
    }
}
