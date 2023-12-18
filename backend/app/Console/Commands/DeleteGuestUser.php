<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Models\GuestUser;

class DeleteGuestUser extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'delete_logout_guest_users:info';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'ログアウトしたゲストユーザーは論理削除されているので、それを物理削除する';

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
        try {
            $message = $this->hardDeleteLoggedOutGuestUser();
            \Log::channel('task')->info('ゲストユーザーの削除:' . $message);
        } catch (\Throwable $e) {
            \Log::error('ゲストユーザー削除エラー:' . $e->getMessage());
            \Log::channel('task')->error('ゲストユーザー削除エラー:' . $e->getMessage());
        }
    }

    protected function hardDeleteLoggedOutGuestUser()
    {
        $yesterday = Carbon::yesterday()->endOfDay();

        $deleteTargetCount =  GuestUser::onlyTrashed()->whereDate('deleted_at', '<', $yesterday)->count();
        if ($deleteTargetCount) {
            GuestUser::onlyTrashed()->whereDate('deleted_at', '<', $yesterday)->forceDelete();
            return $deleteTargetCount . "件削除しました";
        } else {
            return "削除対象がありませんでした";
        }
    }
}
