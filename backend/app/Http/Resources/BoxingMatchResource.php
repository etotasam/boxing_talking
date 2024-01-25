<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;
use App\Models\MatchResult;
use App\Http\Resources\BoxerResource;
use App\Http\Resources\MatchResultResource;


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
            "red_boxer" => new BoxerResource($this->match->redBoxer),
            "blue_boxer" => new BoxerResource($this->match->blueBoxer),
            "country" => $this->match->country,
            "venue" => $this->match->venue,
            "grade" => $this->match->grade,
            "titles" => $this->formatTitles($this->match->organization),
            "weight" => $this->match->weight,
            "match_date" => $this->match->match_date,
            "count_red" => $this->match->count_red,
            "count_blue" => $this->match->count_blue,
            "result" => $resultResource
        ];
    }

    /**
     * @param Collection $organizations
     */
    private function formatTitles($organizations): array
    {
        $organizationsArray = !empty($organizations) ? $this->formatTitlesInCaseExists($organizations)->toArray() : [];
        return $organizationsArray;
    }

    private function formatTitlesInCaseExists(Collection $organizations): Collection
    {
        $organizationsArray =  $organizations->map(function ($organization) {
            $title = ["organization" => $organization->name, 'weightDivision' => $this->weight];
            return $title;
        });
        return $organizationsArray;
    }
}
