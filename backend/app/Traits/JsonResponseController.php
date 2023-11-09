<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait JsonResponseController
{
  /**
   * @var int
   */
  protected $httpStatusCode = 200;

  /**
   * statusCodeの取得
   * @return int
   */
  protected function getHttpStatusCode()
  {
    return $this->httpStatusCode;
  }

  /**
   * statusCodeの設定
   * @param int $statusCode
   * @return self
   */
  protected function setHttpStatusCode(int $statusCode): self
  {
    $this->httpStatusCode = $statusCode;
    return $this;
  }

  /**
   * クエリエラー
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseInvalidQuery(string $message, ?int $errorCode = null): JsonResponse
  {
    return $this->setHttpStatusCode(500)
      ->responseWithError($message, $errorCode);
  }

  /**
   * Bad Request
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseBadRequest(string $message, ?int $errorCode = null)
  {
    return $this->setHttpStatusCode(400)
      ->responseWithError($message, $errorCode);
  }

  /**
   * 無効な認証
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseUnauthorized(string $message, ?int $errorCode = null)
  {
    return $this->setHttpStatusCode(401)
      ->responseWithError($message, $errorCode);
  }

  /**
   * 権限不足エラー
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseAccessDenied(string $message, ?int $errorCode = null)
  {
    return $this->setHttpStatusCode(403)
      ->responseWithError($message, $errorCode);
  }

  /**
   * 対象データが見つからないエラー
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseNotFound(string $message, ?int $errorCode = null)
  {
    return $this->setHttpStatusCode(404)
      ->responseWithError($message, $errorCode);
  }

  /**
   * エラーメッセージ付きresponse
   * @param string $message
   * @return JsonResponse
   */
  protected function responseWithError(string $message, ?int $errorCode)
  {
    return $this->responseApi([
      "success" => false,
      "message" => $message,
      "errorCode" => $errorCode ?? false
    ]);
  }

  /**
   * 成功時のresponse
   * @param string $message
   * @return JsonResponse
   */
  public function responseSuccessful(string $message)
  {
    return $this->setHttpStatusCode(200)
      ->responseApi([
        "success" => true,
        "message" => $message
      ]);
  }


  /**
   * @param array
   * @return JsonResponse
   */
  protected function responseApi(array $data)
  {
    return response()->json($data, $this->getHttpStatusCode());
  }
}
