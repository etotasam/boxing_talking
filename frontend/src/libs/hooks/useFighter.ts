import { useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "../axios"
import { useMessageController } from "@/libs/hooks/messageController";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";
import { queryKeys } from "@/libs/queryKeys"


//! 選手データ
export enum Stance {
  Southpaw = "southpaw",
  Orthodox = "orthodox",
}
export enum Nationality {
  Japan = "Japan",
  Mexico = "Mexico",
  USA = "USA",
  Kazakhstan = "Kazakhstan",
  UK = "UK",
  Rusia = "Rusia",
  Philpin = "Philpin"
}
export type FighterType = {
  id: number,
  name: string,
  country: Nationality | undefined,
  birth: string;
  height: number | undefined,
  stance: Stance,
  ko: number,
  win: number,
  lose: number,
  draw: number
}


export const useFetchFighters = () => {
  const fetcher = async () => await Axios.get("api/fighter").then(value => value.data)
  const { data, isLoading, isError, isFetching, isRefetching } = useQuery<FighterType[]>("api/fighter", fetcher)

  return { data, isLoading, isError, isFetching, isRefetching }
}

export const useUpdateFighter = () => {
  const queryClient = useQueryClient()
  const { setMessageToModal } = useMessageController()
  const snapshotFighters = queryClient.getQueryData<FighterType[]>(queryKeys.fetchFighter)
  const api = async (updateFighterData: FighterType): Promise<Record<string, string> | void> => {
    try {
      setMessageToModal(MESSAGE.FIGHTER_EDIT_UPDATEING, ModalBgColorType.NOTICE);
      //? 編集した選手データを含めた全選手データ
      const updateFightersData = snapshotFighters?.reduce((acc: FighterType[], curr: FighterType) => {
        if (curr.id === updateFighterData.id) {
          return [...acc, updateFighterData];
        }
        return [...acc, curr];
      }, []);
      queryClient.setQueryData(queryKeys.fetchFighter, updateFightersData)
      await Axios.put("api/fighter/update", updateFighterData);
      setMessageToModal(MESSAGE.FIGHTER_EDIT_SUCCESS, ModalBgColorType.SUCCESS);
    } catch (error) {
      console.log(error);
      queryClient.setQueryData(queryKeys.fetchFighter, snapshotFighters)
      setMessageToModal(MESSAGE.FIGHTER_EDIT_FAILD, ModalBgColorType.ERROR);
    }
  }
  const { mutate, isLoading } = useMutation(api)
  const updateFighter = (updateFighterdata: FighterType) => {
    mutate(updateFighterdata)
  }
  return { updateFighter, isLoading }
}



