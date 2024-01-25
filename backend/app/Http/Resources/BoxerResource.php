<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Boxer;

class BoxerResource extends JsonResource
{

    public function __construct(private Boxer $boxer)
    {
        parent::__construct($boxer);
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
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
            'id' => $this->boxer->id,
            'name' => $this->boxer->name,
            'eng_name' => $this->boxer->eng_name,
            'country' => $this->boxer->country,
            'birth' => $this->boxer->birth,
            'height' => $this->boxer->height,
            'reach' => $this->boxer->reach,
            'style' => $this->boxer->style,
            'ko' => $this->boxer->ko,
            'win' => $this->boxer->win,
            'draw' => $this->boxer->draw,
            'lose' => $this->boxer->lose,
            'titles' => $titles,
        ];
    }
}
