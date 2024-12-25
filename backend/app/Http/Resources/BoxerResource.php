<?php

namespace App\Http\Resources;

use \Illuminate\Support\Collection;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Boxer;
use App\Models\MatchBoxerSnapshot;
use App\Models\BoxerTitleSnapshot;

class BoxerResource extends JsonResource
{

    public function __construct(private Boxer $boxer, private $snapshot, private $titleSnapshot = null)
    {

        parent::__construct($boxer);
        $this->snapshot = $snapshot;
        $this->titleSnapshot = $titleSnapshot;
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

        //? 試合データを表示する時(スナップショットがある時)はスナップショットを使用する
        $titleCollection = $this->titleSnapshot ?? $this->titles;

        $titles = $titleCollection->map(function ($title) {
            $name = $title->organization->name;
            $weight = $title->weightDivision->weight;
            return ["organization" => $name, "weight" => $weight];
        });


        return [
            'id' => $this->boxer->id,
            'name' => $this->boxer->name,
            'engName' => $this->boxer->eng_name,
            'country' => $this->boxer->country,
            'birth' => $this->boxer->birth,
            'height' => $this->boxer->height,
            'reach' => $this->boxer->reach,
            'style' => $this->snapshot->style ?? $this->boxer->style,
            'ko' => $this->snapshot->ko ?? $this->boxer->ko,
            'win' => $this->snapshot->win ?? $this->boxer->win,
            'draw' => $this->snapshot->draw ?? $this->boxer->draw,
            'lose' => $this->snapshot->lose ?? $this->boxer->lose,
            'titles' => $titles,
        ];
    }
}
