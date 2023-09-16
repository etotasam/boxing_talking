<?php

namespace App\Helpers;

use Exception;

class ErrorHelper
{
  public static function createErrorResponse($input_name, $error_message, $error_code)
  {
    return response()->json(['errors' => [$input_name => [$error_message]]], $error_code);
  }


  public static function throwError($error_message, $error_code)
  {
    throw new Exception($error_message, $error_code);
  }
}
