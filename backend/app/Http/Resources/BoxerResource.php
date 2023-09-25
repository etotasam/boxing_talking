<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Boxer;

class BoxerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  boxer boxer Model
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     *
     */
    public function toArray($request)
    {
        $titles = $this->titles->map(function ($title) {
            $name = $title->organization->name;
            $weight = $title->weightDivision->weight;
            return ["organization" => $name, "weight" => $weight];
        });

        return [
            'id' => $this->id,
            'name' => $this->name,
            'eng_name' => $this->eng_name,
            'country' => $this->country,
            'birth' => $this->birth,
            'height' => $this->height,
            'reach' => $this->reach,
            'style' => $this->style,
            'ko' => $this->ko,
            'win' => $this->win,
            'draw' => $this->draw,
            'lose' => $this->lose,
            'titles' => $titles,
        ];
    }
}
