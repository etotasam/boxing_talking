import { useCallback, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "../axios"
import { queryKeys } from "@/libs/queryKeys"
import { useQueryState } from "@/libs/hooks/useQueryState"
import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { useLocation, useNavigate } from "react-router-dom";
// import { useFighters } from "./fetchers";

//! message contoller
import { useToastModal, ModalBgColorType } from "./useToastModal";
import { MESSAGE } from "@/libs/utils";


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
  Philpin = "Philpin",
  Ukrine = "Ukrine"
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

//! 検索した選手数の取得
// export const useCountFighters = () => {
//   const fetcher = async () => await Axios.get<number>(queryKeys.countFighter).then(v => v.data)
//   const { data, isLoading } = useQuery(queryKeys.countFighter, fetcher)
//   return { data, isLoading }
// }

//! 選手データ取得
export const limit = 10
export const useFetchFighters = () => {

  type SearchWordType = {
    name?: string | undefined | null,
    country?: Nationality | undefined | null
  }
  type FetcherPropsType = {
    page: number,
    limit: number,
    searchWords: SearchWordType | undefined
  }

  //? params page の取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  let paramPage = Number(query.get("page"));
  const paramName = (query.get("name"));
  const paramCountry = (query.get("country")) as Nationality | null;
  if (!paramPage) {
    paramPage = 1
  }
  const api = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<{ fighters: FighterType[], fighters_count: number }>(queryKeys.fighter, { params: { page, limit, ...searchWords } }).then(value => value.data)
    return res
  }
  const { data: fighters, isLoading, isError, isPreviousData, refetch, isRefetching } = useQuery<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: paramPage }], () => api({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), { keepPreviousData: true, staleTime: Infinity })
  const data = fighters?.fighters
  const count = fighters?.fighters_count
  return { data, count, isLoading, isError, isPreviousData, refetch, isRefetching }
}

//! 選手データ更新
export const useUpdateFighter = () => {
  const queryClient = useQueryClient()
  //? params page の取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  let paramPage = Number(query.get("page"));
  const { setToastModalMessage } = useToastModal()
  const snapshotFighters = queryClient.getQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: paramPage }])
  const api = async (updateFighterData: FighterType): Promise<Record<string, string> | void> => {
    try {
      // setMessageToModal(MESSAGE.FIGHTER_EDIT_UPDATEING, ModalBgColorType.NOTICE);
      //? 編集した選手データを含めた全選手データ
      const updateFightersData = snapshotFighters?.fighters.reduce((acc: FighterType[], curr: FighterType) => {
        if (curr.id === updateFighterData.id) {
          return [...acc, updateFighterData];
        }
        return [...acc, curr];
      }, []);
      await Axios.put(queryKeys.fighter, updateFighterData);
      queryClient.setQueryData([queryKeys.fighter, { page: paramPage }], { fighters: updateFightersData, fightes_count: snapshotFighters?.fighters_count })
      setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: ModalBgColorType.SUCCESS });
    } catch (error) {
      console.log(error);
      queryClient.setQueryData([queryKeys.fighter, { page: paramPage }], snapshotFighters)
      setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: ModalBgColorType.ERROR });
    }
  }
  const { mutate, isLoading } = useMutation(api)
  const updateFighter = (updateFighterdata: FighterType) => {
    mutate(updateFighterdata)
  }
  return { updateFighter, isLoading }
}

//! 選手登録
export const useRegisterFighter = () => {
  const queryClient = useQueryClient()
  const { count: fightersCount } = useFetchFighters()
  const { setToastModalMessage } = useToastModal()
  const api = useCallback(async (newFighterData: FighterType) => {
    try {
      setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_PENDING, bgColor: ModalBgColorType.NOTICE })
      await Axios.post(queryKeys.fighter, newFighterData).then(v => v.data)
      setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_SUCCESS, bgColor: ModalBgColorType.SUCCESS })
    } catch (error) {
      setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_FAILD, bgColor: ModalBgColorType.ERROR })
    }
  }, []);
  const { mutate, isLoading, isError } = useMutation(api, {
    onMutate: async () => {
      // const fightersCount = queryClient.getQueryData<number>(queryKeys.countFighter)
      if (!fightersCount) return
      const isLeeway = !!(fightersCount % limit)
      const pageCount = Math.ceil(fightersCount / limit)
      return { isLeeway, pageCount }
    }
  })
  const registerFighter = (newFighterData: FighterType) => {
    mutate(newFighterData, {
      onSuccess: (data, newFighterData, context) => {
        if (context.isLeeway) {
          const fightersData = queryClient.getQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: context.pageCount }])!.fighters
          if (fightersData?.length) {
            queryClient.setQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: context.pageCount }], (oldData) => {
              return { fighters: [...fightersData, newFighterData], fighters_count: oldData!.fighters_count }
            })
          }
        } else {
          queryClient.setQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: context.pageCount++ }], (oldData) => {
            return { fighters: [newFighterData], fighters_count: oldData!.fighters_count }
          })
        }
        queryClient.setQueryData<number>(queryKeys.countFighter, (prevFightersCount) => {
          return prevFightersCount! ++
        })
        queryClient.invalidateQueries(queryKeys.fighter)
      }
    })
  }
  return { registerFighter, isLoading, isError }
}

//! 選手データ削除
export const useDeleteFighter = () => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()
  const { setToastModalMessage } = useToastModal()
  //? 選手の数を取得
  // const { data: fightersCount } = useCountFighters()
  const { count: fightersCount } = useFetchFighters()
  //? page数を計算
  const [pageCount, setPageCount] = useState<number>(0)
  useEffect(() => {
    if (!fightersCount) return
    const pages = Math.ceil(fightersCount / limit)
    setPageCount(pages)
  }, [fightersCount])

  //? paramsを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));

  const api = async (fighterData: FighterType) => await Axios.delete(queryKeys.fighter, { data: { fighterId: fighterData.id } }).then(v => v.data)
  const { mutate, isLoading, isError } = useMutation(api, {
    onMutate: (fighterData) => {
      // setMessageToModal(MESSAGE.FIGHTER_DELETING, ModalBgColorType.NOTICE)
      const snapshotFighters = queryClient.getQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: paramPage }])!.fighters
      const widtoutDeleteFighters = queryClient.getQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: paramPage }])!.fighters.filter(fighter => fighter.id !== fighterData.id)
      return { snapshotFighters, widtoutDeleteFighters }
    }
  })
  const deleteFighter = (fighterData: FighterType) => {
    mutate(fighterData, {
      onSuccess: async (data, fighterData, context) => {
        setToastModalMessage({ message: MESSAGE.FIGHTER_DELETED, bgColor: ModalBgColorType.DELETE })
        queryClient.setQueryData<{ fighters: FighterType[], fighters_count: number }>([queryKeys.fighter, { page: paramPage }], (oldData) => {
          return { fighters: context.widtoutDeleteFighters, fighters_count: oldData!.fighters_count - 1 }
        })
        // queryClient.setQueryData<number>(queryKeys.countFighter, ((prevFightersCount) => {
        //   return prevFightersCount! - 1
        // }))
        if (!context.widtoutDeleteFighters.length) {
          if (paramPage > 1) {
            navigate(`/fighter/edit?page=${paramPage - 1}`)
          }
        }
        //? 削除した選手より後のpage情報は再取得させる
        const pages = [...Array(pageCount + 1)].map((_, num) => num).filter(n => n >= paramPage)
        pages.forEach((page) => {
          queryClient.removeQueries([queryKeys.fighter, { page }], { exact: true })
        })
        queryClient.setQueryData(queryKeys.fighterEditData, initialFighterInfoState)
      },
      onError: () => {
        setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }

  return { deleteFighter, isLoading, isError }
}
