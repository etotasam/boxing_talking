<?php

namespace App\Exceptions;

class CustomErrorCodes
{
  public const TITLE_ALREADY_HAS_OTHER_BOXER = 30;
  public const BOXER_ALREADY_HAS_MATCH = 31;
  public const BOXER_NOT_FOUND = 44;
  public const BOXER_DELETE_FAILED = 50;
  public const UNABLE_TO_GENERATE_GUEST_TODAY = 40;
}
