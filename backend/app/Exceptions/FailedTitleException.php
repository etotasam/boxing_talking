<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class FailedTitleException extends Exception
{
    public function __construct(string $message, int $errorCode = 0, Throwable $previous = null)
    {
        parent::__construct($message, $errorCode, $previous);
    }

    public static function create(): self
    {
        return new static("Failed store title");
    }

    public static function titleAlreadyHasOtherBoxer(string $organization, string $division, string $boxerName): self
    {
        return new static($organization . $division . "級タイトルは" . $boxerName . "が保持しています");
    }
}
