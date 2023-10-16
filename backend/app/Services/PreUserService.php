<?php

namespace App\Services;

use Illuminate\Http\Response;
use App\Jobs\MailSendJob;
use App\Models\PreUser;
use App\Repository\PreUserRepository;

class PreUserService
{

  public function __construct(PreUser $preUser)
  {
    $this->preUser = $preUser;
  }

  /**
   * @param array $preUserDataForRegister associative array [name. email, password]
   */
  public function createPreUserAndSendEmail($preUserDataForRegister): void
  {
    $preUser = PreUserRepository::create($preUserDataForRegister);
    if (!$preUser) {
      throw new Exception("Failed pre user create", 500);
    }

    MailSendJob::dispatch($preUser->id, $preUserDataForRegister['name'], $preUserDataForRegister['email']);
  }
}
