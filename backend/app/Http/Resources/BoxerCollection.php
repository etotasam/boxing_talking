<?php

namespace App\Http\Resources;

use Illuminate\Support\Collection;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BoxerCollection extends ResourceCollection
{
    protected $boxerCount;

    public function __construct(Collection $boxerCollection, int $boxerCount)
    {
        parent::__construct($boxerCollection);
        $this->boxerCount = $boxerCount;
    }
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'boxers' => BoxerResource::collection($this->collection),
            'count' => $this->boxerCount
        ];
    }
}
