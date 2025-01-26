<?php

namespace App\Http\Resources;

use \Illuminate\Support\Collection;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Boxer;
use App\Http\Resources\TitleResource;
use App\Models\MatchBoxerSnapshot;
use App\Models\BoxerTitleSnapshot;

class BoxerResource extends JsonResource
{

    public function __construct(private Boxer $boxer, private $boxerRecordSnapshot, private $titleSnapshot = null)
    {

        parent::__construct($boxer);
        $this->boxerRecordSnapshot = $boxerRecordSnapshot;
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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'engName' => $this->eng_name,
            'country' => $this->country,
            'birth' => $this->birth,
            'height' => $this->height,
            'reach' => $this->reach,
            'style' => $this->boxerRecordSnapshot->style ?? $this->style,
            'ko' => $this->boxerRecordSnapshot->ko ?? $this->ko,
            'win' => $this->boxerRecordSnapshot->win ?? $this->win,
            'draw' => $this->boxerRecordSnapshot->draw ?? $this->draw,
            'lose' => $this->boxerRecordSnapshot->lose ?? $this->lose,
            'titles' => new TitleResource($this->boxer, $this->titleSnapshot),
            // 'titles' => $titles,
        ];
    }
}
