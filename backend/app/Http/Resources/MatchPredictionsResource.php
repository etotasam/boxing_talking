<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MatchPredictionsResource extends JsonResource
{

    public function __construct(private array $matchPredictions)
    {
        parent::__construct($matchPredictions);
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $predictions = collect($this->matchPredictions);
        $total = ($predictions["red"] ?? 0) + ($predictions["blue"] ?? 0);
        return [
            "totalVotes" => $total,
            "red" => $predictions["red"] ?? 0,
            "blue" => $predictions["blue"] ?? 0
        ];
    }
}
