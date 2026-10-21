<?php

namespace Tests\Feature\MiddlewareTest;

use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RequestForgeryProtectionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['sanctum.stateful' => ['localhost']]);

        // 通常のFeature Testで省略されるCSRF判定を、このテストでは有効にする。
        $this->app->bind(VerifyCsrfToken::class, function ($app) {
            return new class($app, $app['encrypter']) extends VerifyCsrfToken {
                protected function runningUnitTests()
                {
                    return false;
                }
            };
        });

        foreach (['web', 'api'] as $group) {
            Route::middleware($group)->match(
                ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
                '/s6-forgery-test/'.$group,
                fn () => response()->json(['accepted' => true])
            );
        }
    }

    /** webとSanctum経路で、送信元とトークンに応じた更新の許否を保証する。 */
    #[DataProvider('requestCases')]
    public function testRequestForgeryPolicy(
        string $group,
        string $scheme,
        ?string $site,
        string $token,
        int $status
    ): void {
        $headers = ['Origin' => $scheme.'://localhost'];
        if ($site !== null) {
            $headers['Sec-Fetch-Site'] = $site;
        }
        if ($token !== 'missing') {
            $headers['X-CSRF-TOKEN'] = $token === 'valid' ? 's6-session-token' : 'invalid';
        }

        $this->withSession(['_token' => 's6-session-token'])
            ->withHeaders($headers)
            ->postJson($scheme.'://localhost/s6-forgery-test/'.$group)
            ->assertStatus($status);
    }

    public static function requestCases(): iterable
    {
        foreach (['web', 'api'] as $group) {
            foreach (['http', 'https'] as $scheme) {
                foreach (['same-origin', 'same-site', 'cross-site', 'none', null] as $site) {
                    foreach (['valid', 'missing', 'invalid'] as $token) {
                        // HTTP上の人工ヘッダーも標準実装は評価するため、その契約も明示する。
                        $status = $site === 'same-origin' || $token === 'valid' ? 200 : 419;
                        yield "$group $scheme ".($site ?? 'no-header')." $token" => [
                            $group, $scheme, $site, $token, $status,
                        ];
                    }
                }
            }
        }
    }

    /** POST以外の更新も拒否し、安全な読み取りメソッドは妨げない。 */
    public function testProtectionCoversOtherWriteMethodsAndAllowsReadMethods(): void
    {
        foreach (['web', 'api'] as $group) {
            foreach (['PUT', 'PATCH', 'DELETE'] as $method) {
                $this->withHeaders(['Origin' => 'https://localhost'])
                    ->json($method, 'https://localhost/s6-forgery-test/'.$group)
                    ->assertStatus(419);
            }
            foreach (['GET', 'HEAD', 'OPTIONS'] as $method) {
                $this->call($method, 'https://localhost/s6-forgery-test/'.$group)
                    ->assertSuccessful();
            }
        }
    }
}
