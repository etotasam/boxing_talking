<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use App\Models\BoxingMatch;

class MatchTitleBeltsResource extends JsonResource
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
        $this->match->load(['titleBelts']);

        return $this->formatTitles(collect($this->match->titleBelts));
    }

    /**
     * @param Collection $organizations
     */
    private function formatTitles(Collection $organizations): array
    {
        $organizationsArray = !empty($organizations) ? $this->formatTitlesInCaseExists($organizations)->toArray() : [];
        return $organizationsArray;
    }

    private function formatTitlesInCaseExists(Collection $organizations): Collection
    {
        $organizationsArray =  $organizations->map(function ($organization) {
            $title = ["organization" => $organization->name, 'weightDivision' => $this->getWeight->weight];
            return $title;
        });
        return $organizationsArray;
    }
}
