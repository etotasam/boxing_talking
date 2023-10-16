<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use App\Services\BoxerService;

class BoxingMatchResource extends JsonResource
{

    protected $boxerService;
    public function __construct($resource)
    {
        $this->resource = $resource;
        $this->boxerService = new BoxerService;
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return  [
            "id" => $this->resource->id,
            "red_boxer" => $this->boxerService->getBoxerSingleById($this->resource->red_boxer_id),
            "blue_boxer" => $this->boxerService->getBoxerSingleById($this->resource->blue_boxer_id),
            "country" => $this->resource->country,
            "venue" => $this->resource->venue,
            "grade" => $this->resource->grade,
            "titles" => $this->formatTitles($this->resource->match),
            "weight" => $this->resource->weight,
            "match_date" => $this->resource->match_date,
            "count_red" => $this->resource->count_red,
            "count_blue" => $this->resource->count_blue
        ];
    }

    private function formatTitles(): array
    {
        $organizations = $this->organization;
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
