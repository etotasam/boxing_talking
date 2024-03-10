import { useMemo } from "react"
import { flatten } from 'lodash';
//!types
import { MatchDataType } from "@/assets/types"
//! func
import { isMatchDatePast } from "@/assets/functions";

//? 試合データの並び替え（試合日が今日以降のと過去のを分ける）
export const useSortMatches = (matchesData: MatchDataType[] | undefined) => {

  const sortedMatches = useMemo((): { beforeMatches: MatchDataType[], afterMatches: MatchDataType[] } => {
    if (!matchesData) return { beforeMatches: [], afterMatches: [] }
    return matchesData.reduce(
      (accumulator: { beforeMatches: MatchDataType[], afterMatches: MatchDataType[] }, current) => {
        const isPastDateOfFight = isMatchDatePast(current);
        if (isPastDateOfFight) {
          return { ...accumulator, afterMatches: [current, ...accumulator.afterMatches] };
        } else {
          return { ...accumulator, beforeMatches: [...accumulator.beforeMatches, current] };
        }
      },
      { beforeMatches: [], afterMatches: [] }
    );

  }, [matchesData])

  // const sortedMatches = useMemo((): MatchDataType[] | undefined => {
  //   if (!matchesData) return
  //   const multipleArrayMatchData = matchesData.reduce(
  //     (accumulator: MatchDataType[][], current) => {
  //       const isPastDateOfFight = isMatchDatePast(current);
  //       if (isPastDateOfFight) {
  //         return [[...accumulator[0]], [current, ...accumulator[1]]];
  //       } else {
  //         return [[...accumulator[0], current], [...accumulator[1]]];
  //       }
  //     },
  //     [[], []]
  //   );
  //   return flatten(multipleArrayMatchData)
  // }, [matchesData])

  return { ...sortedMatches }
}