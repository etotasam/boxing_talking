<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class FailedStoreTitleMatchesException extends Exception
{
    public function __construct(string $message, int $errorCode = 0, Throwable $previous = null)
    {
        parent::__construct($message, $errorCode, $previous);
    }

    public static function create(): self
    {
        return new static("Failed store title_matches");
    }
}
