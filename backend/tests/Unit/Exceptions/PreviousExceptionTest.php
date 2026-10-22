<?php

namespace Tests\Unit\Exceptions;

use App\Exceptions\BoxerException;
use App\Exceptions\FailedStoreTitleMatchesException;
use App\Exceptions\FailedTitleException;
use App\Exceptions\NonAdministratorException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class PreviousExceptionTest extends TestCase
{
    /** previous省略・明示null・例外ありのmessage/code/チェーンを維持する。 */
    #[DataProvider('exceptionClasses')]
    public function testExceptionPreservesItsCause(string $class): void
    {
        $previous = new RuntimeException('cause');
        foreach ([new $class('failure', 123), new $class('failure', 123, null), new $class('failure', 123, $previous)] as $index => $exception) {
            $this->assertSame('failure', $exception->getMessage());
            $this->assertSame(123, $exception->getCode());
            $this->assertSame($index === 2 ? $previous : null, $exception->getPrevious());
        }
    }

    public static function exceptionClasses(): array
    {
        return [
            'boxer' => [BoxerException::class],
            'store title matches' => [FailedStoreTitleMatchesException::class],
            'title' => [FailedTitleException::class],
            'non administrator' => [NonAdministratorException::class],
        ];
    }
}
