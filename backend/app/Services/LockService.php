<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class LockService
{
  public function isFreeLock($lockName)
  {
    return DB::select("select IS_FREE_LOCK(?) as result", [$lockName])[0]->result;
  }

  public function newGetLock()
  {
    return DB::select("select GET_LOCK('test_locks', 100) as result")[0]->result;
  }

  public function getLock($lockName, $timeOutSeconds)
  {
    return DB::select("select GET_LOCK(?,?) as result", [$lockName, $timeOutSeconds])[0]->result;
  }

  public function releaseLock($lockName)
  {
    return DB::select("select RELEASE_LOCK(?) as result", [$lockName])[0]->result;
  }
}
