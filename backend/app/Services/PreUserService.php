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
   * @param string $name
   * @param string $email
   * @param string $password
   */
  public function createPreUserAndSendEmail($name, $email, $password): void
  {
    DB::beginTransaction();
    try {
      $preUser = $this->preUserRepository->createPreUser($name, $email, $password);
      if (!$preUser) {
        throw new Exception("Failed pre_user create");
      }

      MailSendJob::dispatch($preUser->id, $name, $email);
    } catch (\Exception $e) {
      DB::rollback();
      throw new \Exception($e->getMessage() ?? "Failed send mail");
    }

    DB::commit();
  }
}
