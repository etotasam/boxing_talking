<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use \App\Models\BoxingMatch;
use \App\Models\Comment;
use \App\Models\Vote;
use Illuminate\Support\Facades\DB;

class DeleteMatches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'delete_matches:info';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'delete matches, comments, votes';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $date_of_delete_target = date('Y-m-d',strtotime('-2 week'));
        try {
            DB::transaction(function() use ($date_of_delete_target) {
                $matches_query = BoxingMatch::where('match_date','<', $date_of_delete_target);
                //? 対象matchなし
                if($matches_query->doesntExist()) {
                    return \Log::info("削除対象なし");
                }
                $all_comments_length = 0;
                    foreach($matches_query->get() as $match) {
                        //? matchに紐づくコメントの削除
                        $comment_query = Comment::where('match_id',$match->id);
                        if($comment_query->exists()) {
                            $all_comments_length += $comment_query->count();
                            $comment_query->delete();
                        }else {
                            $all_comments_length += 0;
                        }
                        //? matchに紐づくvotesの削除
                        Vote::where('match_id', $match->id)->delete();
                }
                $delete_matches_length = $matches_query->count();
                //? matchの削除
                $matches_query->delete();
                return \Log::info($delete_matches_length . "件の試合の削除と" .$all_comments_length . "件のコメントを削除");
            }, 5);
        } catch (\Exception $e) {
            return \Log::error("エラー:" . $e->getMessage());
        }
    }
}
