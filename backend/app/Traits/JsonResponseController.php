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
   * @var int
   */
  protected $errorCode;

  /**
   * statusCodeの取得
   * @return int
   */
  public function getHttpStatusCode()
  {
    return $this->httpStatusCode;
  }

  /**
   * statusCodeの設定
   * @param int $statusCode
   * @return self
   */
  public function setHttpStatusCode(int $statusCode): self
  {
    $this->httpStatusCode = $statusCode;
    return $this;
  }


  /**
   * クエリエラー
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseInvalidQuery(?string $message = null): JsonResponse
  {
    return $this->setHttpStatusCode(500)
      ->responseWithError($message ?? "クエリが無効");
  }

  /**
   * Bad Request
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseBadRequest(?string $message = null)
  {
    return $this->setHttpStatusCode(400)
      ->responseWithError($message ?? "リクエストが無効");
  }

  /**
   * 無効な認証
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseUnauthorized(?string $message = null)
  {
    return $this->setHttpStatusCode(401)
      ->responseWithError($message ?? "無効な認証");
  }

  /**
   * 権限不足エラー
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseAccessDenied(?string $message = null)
  {
    return $this->setHttpStatusCode(403)
      ->responseWithError($message ?? "権限なしのエラー");
  }

  /**
   * 対象データが見つからないエラー
   * @param ?string $message
   * @return JsonResponse
   */
  public function responseNotFound(?string $message = null)
  {
    return $this->setHttpStatusCode(404)
      ->responseWithError($message ?? "データが見つからないエラー");
  }

  /**
   * エラーメッセージ付きresponse
   * @param string $message
   * @return JsonResponse
   */
  public function responseWithError(string $message)
  {
    return $this->responseApi([
      "success" => false,
      "message" => $message
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
  public function responseApi(array $data)
  {
    return response()->json($data, $this->getHttpStatusCode());
  }
}
