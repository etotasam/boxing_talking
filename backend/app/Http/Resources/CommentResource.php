<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Repositories\UserRepository;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $user = UserRepository::get($this->user_id);
        $postUserName = isset($user) ? $user->name : null;
        $formattedComment = nl2br(htmlspecialchars($this->comment));

        return [
            'id' => $this->id,
            'post_user_name' => $postUserName,
            "comment" => $formattedComment,
            "created_at" => $this->created_at
        ];
    }
}
