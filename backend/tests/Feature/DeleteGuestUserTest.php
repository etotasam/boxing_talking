<?php

namespace Tests\Feature;

use App\Models\GuestUser;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteGuestUserTest extends TestCase
{
    use RefreshDatabase;

    /** Tokyoの日付変更直後でも、前日より前の削除済みゲストだけを物理削除する。 */
    public function testDeletionBoundaryJustAfterTokyoMidnight(): void
    {
        $this->assertDeletionBoundary('2026-10-22 00:00:01');
    }

    /** Tokyoの一日の終端でも、前日・当日・利用中のゲストを保持する。 */
    public function testDeletionBoundaryAtEndOfTokyoDay(): void
    {
        $this->assertDeletionBoundary('2026-10-22 23:59:59');
    }

    /** 日次コマンドの公開動作を、独立した固定日時の境界データで確認する。 */
    private function assertDeletionBoundary(string $now): void
    {
        $this->assertSame('Asia/Tokyo', config('app.timezone'));
        $this->travelTo(Carbon::parse($now, 'Asia/Tokyo'));

        try {
            $guests = [];
            foreach ([
                'old' => '2026-10-20 23:59:59',
                'yesterday_start' => '2026-10-21 00:00:00',
                'yesterday_end' => '2026-10-21 23:59:59',
                'today' => '2026-10-22 00:00:00',
                'active' => null,
            ] as $label => $deletedAt) {
                $guest = GuestUser::create([]);
                if ($deletedAt !== null) {
                    $guest->delete();
                    $guest->deleted_at = $deletedAt;
                    $guest->save();
                }
                $guests[$label] = $guest->id;
            }

            $this->artisan('delete_logout_guest_users:info')->assertSuccessful();
            $this->assertDatabaseMissing('guest_users', ['id' => $guests['old']]);
            foreach (['yesterday_start', 'yesterday_end', 'today', 'active'] as $label) {
                $this->assertDatabaseHas('guest_users', ['id' => $guests[$label]]);
            }
        } finally {
            $this->travelBack();
        }
    }
}
