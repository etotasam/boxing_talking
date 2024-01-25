<?php

namespace App\Services;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Jobs\MailSendJob;
use App\Repositories\Interfaces\PreUserRepositoryInterface;

class PreUserService
{

  protected $preUserRepository;
  public function __construct(PreUserRepositoryInterface $preUserRepository)
  {
    $this->preUserRepository = $preUserRepository;
  }

  /**
   * preUserの作成と、確認用のメール送信
   * @errorCode 50 preUserのcreate失敗
   * @param string $name
   * @param string $email
   * @param string $password
   */
  public function createPreUserAndSendEmail($name, $email, $password): void
  {
    $preUser = $this->preUserRepository->createPreUser($name, $email, $password);
    abort_if(!$preUser, 500);
    MailSendJob::dispatch($preUser->id, $name, $email);
  }
}
