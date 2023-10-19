<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Repositories\Interfaces\UserRepositoryInterface;

class CommentResource extends JsonResource
{

    protected $userRepository;
    public function __construct($resource)
    {
        parent::__construct($resource);
        $this->resource = $resource;
        $this->userRepository = app(UserRepositoryInterface::class);
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $user = $this->userRepository->getUser($this->user_id);
        $postUserName = isset($user) ? $user->name : null;
        $formattedComment = nl2br(htmlspecialchars($this->comment));

        return [
            'id' => $this->resource->id,
            'post_user_name' => $postUserName,
            "comment" => $formattedComment,
            "created_at" => $this->resource->created_at
        ];
    }
}
