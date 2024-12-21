<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\WinLossPrediction;

class WinLossPredictionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param WinLossPrediction
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     *
     */
    public function toArray($request)
    {

        return [
            'matchId' => $this->match_id,
            'prediction' => $this->prediction,
        ];
    }
}
