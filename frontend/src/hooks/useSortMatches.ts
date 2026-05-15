import { useMemo } from "react"
import { MatchDataType } from "@/types"
import { isMatchDatePast } from "@/utils/match";

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

  //     (accumulator: MatchDataType[][], current) => {

  return { ...sortedMatches }
}
