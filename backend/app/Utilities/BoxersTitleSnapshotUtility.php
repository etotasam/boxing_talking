<?php

namespace App\Utilities;

use \Illuminate\Support\Collection;
use App\Models\BoxingMatch;


class BoxersTitleSnapshotUtility
{
  /**
   * ? ボクサーが保持しているタイトルでこの試合に掛けられているタイトルを抽出
   * @param BoxingMatch $match
   * @param int $boxerId
   * @return Collection
   */
  public static function extractHoldTitleSnapshot(BoxingMatch $match, int $boxerId): Collection
  {
    //? この試合に掛けられているタイトルを取得
    $matchTitles = $match->matchTitles;
    //? この試合時にボクサーが保持しているタイトルスナップショットを取得
    $boxerTitleSnapshot = $match->boxerTitleSnapshot;
    //? この試合に掛けられたタイトルでボクサーが保持しているタイトルを抽出
    $targetBoxersHoldTitleSnapshot = $boxerTitleSnapshot->map(function ($titleSnapshot) use ($boxerId, $match, $matchTitles) {

      $isTargetBoxer = $titleSnapshot->boxer_id === $boxerId;

      $isSameWeight = $titleSnapshot->weight_division_id === $match->weight_id;

      $isContainOrganization = $matchTitles->contains(function ($matchTitle) use ($titleSnapshot) {
        return $matchTitle->organization_id === $titleSnapshot->organization_id;
      });

      if ($isTargetBoxer && $isSameWeight && $isContainOrganization) {
        return $titleSnapshot;
      }
    })->filter()->values();

    return $targetBoxersHoldTitleSnapshot;
  }


  /**
   * ? 試合に掛けられたタイトルで保持していないタイトルを抽出
   * @param Collection $holdBoxerTitleSnapshot
   * @param Collection $matchTitles
   * @return Collection $unHoldTitle
   */
  public static function extractUnHoldTitleSnapshot(Collection $holdBoxerTitleSnapshot, Collection $matchTitles): Collection
  {
    $unHoldTitle = $matchTitles->map(function ($matchTitle) use ($holdBoxerTitleSnapshot) {

      $isHoldTitle = $holdBoxerTitleSnapshot->contains(function ($titleSnapshot) use ($matchTitle) {
        $isSameOrganization = $titleSnapshot->organization_id === $matchTitle->organization_id;
        return $isSameOrganization;
      });

      if (!$isHoldTitle) {
        return $matchTitle;
      }
    })->filter()->values();

    return $unHoldTitle;
  }
}
