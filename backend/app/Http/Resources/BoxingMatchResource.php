<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\BoxingMatch;
use App\Http\Resources\BoxerResource;
use App\Http\Resources\MatchResultResource;
use App\Http\Resources\MatchTitleBeltsResource;


class BoxingMatchResource extends JsonResource
{

    public function __construct(private BoxingMatch $match)
    {
        parent::__construct($match);
    }

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {

        $this->match->load(['redBoxer', 'blueBoxer', 'result']);

        $resultResource = $this->match->result
            ? new MatchResultResource($this->match->result)
            : null;
        return  [
            "id" => $this->match->id,
            "redBoxer" => new BoxerResource($this->match->redBoxer),
            "blueBoxer" => new BoxerResource($this->match->blueBoxer),
            "country" => $this->match->country,
            "venue" => $this->match->venue,
            "grade" => $this->match->getGrade->grade,
            "titles" => new MatchTitleBeltsResource($this->match),
            "weight" => $this->match->getWeight->weight,
            "matchDate" => $this->match->match_date,
            "countRed" => $this->match->count_red,
            "countBlue" => $this->match->count_blue,
            "result" => $resultResource
        ];
    }
}
