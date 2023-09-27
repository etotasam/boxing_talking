import { useState, useEffect } from "react"
import { flatten } from 'lodash';
//!types
import { MatchDataType } from "@/assets/types"
//! func
import { isMatchDatePast } from "@/assets/functions";

//? 試合データの並び替え（試合日が今日以降のと過去のを分ける）
export const useSortMatches = (matchesData: MatchDataType[] | undefined) => {
  const [sortedMatches, setSortedMatches] =
    useState<MatchDataType[]>();
  useEffect(() => {
    if (!matchesData) return;
    const multipleArrayMatchData = matchesData.reduce(
      (accumulator: MatchDataType[][], current) => {
        const isFightPast = isMatchDatePast(current);
        if (isFightPast) {
          return [[...accumulator[0]], [current, ...accumulator[1]]];
        } else {
          return [[...accumulator[0], current], [...accumulator[1]]];
        }
      },
      [[], []]
    );

    setSortedMatches(flatten(multipleArrayMatchData));
  }, [matchesData]);

  return { sortedMatches }
}