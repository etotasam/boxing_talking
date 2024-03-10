<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Comment;

class CommentResource extends JsonResource
{

    public function __construct(private Comment $commentInstance)
    {
        parent::__construct($commentInstance);
    }
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $user = $this->commentInstance->postUser;
        $postUserName = isset($user) ? $user->name : null;
        $formattedComment = nl2br(htmlspecialchars($this->commentInstance->comment));
        $timestamp = strtotime($this->commentInstance->created_at);
        $formattedCreatedAt = date('Y-m-d H:i:s', $timestamp);

        return [
            'id' => $this->commentInstance->id,
            'postUserName' => $postUserName,
            "comment" => $formattedComment,
            "createdAt" => $formattedCreatedAt
        ];
    }
}
