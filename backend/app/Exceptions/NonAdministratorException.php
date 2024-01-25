<?php

namespace App\Exceptions;

use App\Models\Administrator;
use Exception;
use Throwable;

class NonAdministratorException extends Exception
{
    public function __construct(string $message, int $errorCode = 0, Throwable $previous = null)
    {
        parent::__construct($message, $errorCode, $previous);
    }

    public static function create(): self
    {
        return new static("Non Administrator");
    }
}
