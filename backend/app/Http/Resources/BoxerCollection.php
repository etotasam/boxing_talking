<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class BoxerCollection extends ResourceCollection
{
    protected $boxerCount;

    public function __construct($resource, $boxerCount)
    {
        parent::__construct($resource);
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
            'boxers' => $this->collection,
            'count' => $this->boxerCount
        ];
    }
}
