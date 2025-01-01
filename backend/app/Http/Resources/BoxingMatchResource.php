<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\BoxingMatch;
use App\Http\Resources\BoxerResource;
use App\Http\Resources\MatchResultResource;
use App\Http\Resources\MatchTitleBeltsResource;
use \Illuminate\Support\Collection;



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


        $resultResource = $this->match->result
            ? new MatchResultResource($this->match->result)
            : null;
        return  [
            "id" => $this->match->id,
            "redBoxer" => new BoxerResource($this->match->redBoxer, $this->match->snapshot["red"], $this->match->titleSnapshot["red"]),
            "blueBoxer" => new BoxerResource($this->match->blueBoxer, $this->match->snapshot["blue"], $this->match->titleSnapshot['blue']),
            "country" => $this->match->country,
            "venue" => $this->match->venue,
            "grade" => $this->match->getGrade->grade,
            "titles" => new MatchTitleBeltsResource($this->match),
            "weight" => $this->match->getWeight->weight,
            "matchDate" => $this->match->match_date,
            "result" => $resultResource
        ];
    }
}
