<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Boxer;


class TitleResource extends JsonResource
{
    //TODO 各resourceにDocを書くべき
    public function __construct(private Boxer $boxer, private $titleSnapshot = null)
    {
        parent::__construct($boxer);
        $this->title = $boxer->titles;
        $this->titleSnapshot = $titleSnapshot;
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $titleCollection = $this->titleSnapshot ?? $this->titles;

        $titles = $titleCollection->map(function ($title) {
            $organization = $title->organization->name;
            $division = $title->weightDivision->weight;

            if (isset($this->titleSnapshot)) {
                $state = $title->state;
                return ["organization" => $organization, "weight" => $division, "state" => $state];
            }

            return ["organization" => $organization, "weight" => $division];
        });
        return $titles;
    }
}
