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

        $this->match->load(['redBoxer', 'blueBoxer', 'result', 'getWeight', 'getGrade']);


        $resultResource = $this->result
            ? new MatchResultResource($this->result)
            : null;

        return  [
            "id" => $this->id,
            "redBoxer" => new BoxerResource($this->redBoxer, $this->boxerRecordSnapshot["red"], $this->titleSnapshot["red"]),
            "blueBoxer" => new BoxerResource($this->blueBoxer, $this->boxerRecordSnapshot["blue"], $this->titleSnapshot['blue']),
            "country" => $this->country,
            "venue" => $this->venue,
            "grade" => $this->getGrade->grade,
            "titles" => new MatchTitleBeltsResource($this->match),
            "weight" => $this->getWeight->weight,
            "matchDate" => $this->match_date,
            "result" => $resultResource
        ];
    }
}
