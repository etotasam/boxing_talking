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
        if (!$this->matchPredictions["isVisible"]) {
            return [
                "isVisible" => false,
                "totalVotes" => null,
                "red" => null,
                "blue" => null
            ];
        }

        $predictions = collect($this->matchPredictions["predictions"]);
        $total = ($predictions["red"] ?? 0) + ($predictions["blue"] ?? 0);
        return [
            "isVisible" => true,
            "totalVotes" => $total,
            "red" => $predictions["red"] ?? 0,
            "blue" => $predictions["blue"] ?? 0
        ];
    }
}
