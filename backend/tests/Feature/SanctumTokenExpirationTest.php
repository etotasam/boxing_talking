<?php

namespace Tests\Feature;

use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class SanctumTokenExpirationTest extends TestCase
{
    use RefreshDatabase;

    /** 期限を指定しない従来形式のトークンを、内容を変えずに保存できる。 */
    public function testTokenWithoutExpirationKeepsStoredData(): void
    {
        $token = new PersonalAccessToken([
            'name' => 'legacy-token',
            'token' => hash('sha256', 'legacy-token-probe'),
            'abilities' => ['read'],
        ]);
        $token->tokenable_type = 'MigrationProbe';
        $token->tokenable_id = 123;
        $token->save();

        $stored = $token->fresh();
        $this->assertNull($stored->expires_at);
        $this->assertSame($token->token, $stored->token);
        $this->assertSame(['read'], $stored->abilities);
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $token->id,
            'name' => 'legacy-token',
            'expires_at' => null,
        ]);
    }

    /** Sanctum 3の期限を保存・日時として取得できる。認証方式は変更しない。 */
    public function testTokenExpirationIsStoredAndCastToDateTime(): void
    {
        $expiresAt = Carbon::parse('2030-01-02 03:04:05');
        $token = new PersonalAccessToken([
            'name' => 'expiring-token',
            'token' => hash('sha256', 'expiring-token-probe'),
            'abilities' => ['read'],
            'expires_at' => $expiresAt,
        ]);
        $token->tokenable_type = 'MigrationProbe';
        $token->tokenable_id = 123;
        $token->save();

        $this->assertInstanceOf(Carbon::class, $token->fresh()->expires_at);
        $this->assertTrue($expiresAt->equalTo($token->fresh()->expires_at));
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $token->id,
            'expires_at' => '2030-01-02 03:04:05',
        ]);
    }
}
