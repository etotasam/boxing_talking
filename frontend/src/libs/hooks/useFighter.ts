import { useCallback, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "../axios"
import { queryKeys } from "@/libs/queryKeys"
import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { useLocation, useNavigate } from "react-router-dom";
//! message contoller
import { useToastModal, ModalBgColorType } from "./useToastModal";
import { MESSAGE, STATUS } from "@/libs/utils";


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
  Ukrine = "Ukrine",
  Canada = "Canada"
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

//! 選手データ取得 and 登録済み選手の数を取得
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

  //? params の取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  let paramPage = Number(query.get("page"));
  const paramName = (query.get("name"));
  const paramCountry = (query.get("country")) as Nationality | null;
  if (!paramPage) {
    paramPage = 1
  }
  const fetchFightersApi = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<FighterType[]>(queryKeys.fighter, { params: { page, limit, ...searchWords } }).then(value => value.data)
    return res
  }
  const { data, isLoading, isError, isPreviousData, refetch, isRefetching } = useQuery<FighterType[]>([queryKeys.fighter, { page: paramPage }], () => fetchFightersApi({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), { keepPreviousData: true, staleTime: Infinity })

  const fetchFightersCount = async (searchWords: SearchWordType) => await Axios.get<number>(queryKeys.countFighter, { params: { ...searchWords } }).then(v => v.data)
  const { data: count } = useQuery<number>(queryKeys.countFighter, () => fetchFightersCount({ name: paramName, country: paramCountry }), { staleTime: Infinity })
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
  const snapshotFighters = queryClient.getQueryData<FighterType[]>([queryKeys.fighter, { page: paramPage }])
  const api = async (updateFighterData: FighterType): Promise<Record<string, string> | void> => {
    try {
      //? 編集した選手データを含めた全選手データ
      const updateFightersData = snapshotFighters?.reduce((acc: FighterType[], curr: FighterType) => {
        if (curr.id === updateFighterData.id) {
          return [...acc, updateFighterData];
        }
        return [...acc, curr];
      }, []);
      await Axios.put(queryKeys.fighter, updateFighterData);
      queryClient.setQueryData([queryKeys.fighter, { page: paramPage }], updateFightersData)
      setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: ModalBgColorType.SUCCESS });
    } catch (error) {
      console.error("選手データ更新:", error);
      queryClient.setQueryData([queryKeys.fighter, { page: paramPage }], snapshotFighters)
      setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: ModalBgColorType.ERROR });
    }
  }
  const { mutate, isLoading, isSuccess } = useMutation(api)
  const updateFighter = (updateFighterdata: FighterType) => {
    mutate(updateFighterdata)
  }
  return { updateFighter, isLoading, isSuccess }
}

//! 選手登録
export const useRegisterFighter = () => {
  const queryClient = useQueryClient()
  const { count: fightersCount } = useFetchFighters()
  const { setToastModalMessage, clearToastModaleMessage } = useToastModal()
  const api = useCallback(async (newFighterData: FighterType) => {
    await Axios.post(queryKeys.fighter, newFighterData).then(v => v.data)
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: async () => {
      clearToastModaleMessage()
      const isLeeway = fightersCount ? !!(fightersCount % limit) : false
      const pageCount = fightersCount ? Math.ceil(fightersCount / limit) : 1
      return { isLeeway, pageCount }
    }
  })
  const registerFighter = (newFighterData: FighterType) => {
    mutate(newFighterData, {
      onSuccess: (_, newFighterData, context) => {
        setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_SUCCESS, bgColor: ModalBgColorType.SUCCESS })
        queryClient.setQueryData<number>(queryKeys.countFighter, (prev) => prev! + 1)
        if (context.isLeeway) {
          const fightersData = queryClient.getQueryData<FighterType[]>([queryKeys.fighter, { page: context.pageCount }])
          if (fightersData?.length) {
            queryClient.setQueryData<FighterType[]>([queryKeys.fighter, { page: context.pageCount }], [...fightersData, newFighterData])
          }
        } else {
          queryClient.setQueryData<FighterType[]>([queryKeys.fighter, { page: context.pageCount++ }], [newFighterData])
        }
        //? 選手数を更新
        queryClient.setQueryData<number>(queryKeys.countFighter, (prevFightersCount) => {
          return prevFightersCount! ++
        })
        queryClient.invalidateQueries(queryKeys.fighter)
      },
      onError: (error: any) => {
        if (error.status === STATUS.NOT_ACCEPTABLE) {
          setToastModalMessage({ message: MESSAGE.FIGHTER_NOT_ABLE_TO_REGISTER, bgColor: ModalBgColorType.ERROR })
          return
        }
        setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }
  return { registerFighter, isLoading, isError, isSuccess }
}

//! 選手データ削除
export const useDeleteFighter = () => {
  const queryClient = useQueryClient()

  const navigate = useNavigate()
  const { setToastModalMessage } = useToastModal()
  //? 選手の数を取得
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
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: (fighterData) => {
      const snapshotFighters = queryClient.getQueryData<FighterType[]>([queryKeys.fighter, { page: paramPage }])
      const widtoutDeleteFighters = queryClient.getQueryData<FighterType[]>([queryKeys.fighter, { page: paramPage }])!.filter(fighter => fighter.id !== fighterData.id)
      return { snapshotFighters, widtoutDeleteFighters }
    }
  })
  const deleteFighter = (fighterData: FighterType) => {
    mutate(fighterData, {
      onSuccess: async (data, fighterData, context) => {
        setToastModalMessage({ message: MESSAGE.FIGHTER_DELETED, bgColor: ModalBgColorType.SUCCESS })
        queryClient.setQueryData<FighterType[]>([queryKeys.fighter, { page: paramPage }], context.widtoutDeleteFighters)
        if (!context.widtoutDeleteFighters.length) {
          if (paramPage > 1) {
            navigate(`/fighter/edit?page=${paramPage - 1}`)
          }
        }

        //? 選手数を更新
        queryClient.setQueryData<number>(queryKeys.countFighter, (prev) => prev! - 1)
        //? 削除した選手より後のpage情報は再取得させる
        const pages = [...Array(pageCount + 1)].map((_, num) => num).filter(n => n >= paramPage)
        pages.forEach((page) => {
          queryClient.removeQueries([queryKeys.fighter, { page }], { exact: true })
        })
        queryClient.setQueryData(queryKeys.fighterEditData, initialFighterInfoState)
      },
      onError: (error: any) => {
        if (error.status === STATUS.NOT_ACCEPTABLE) {
          setToastModalMessage({ message: MESSAGE.FIGHTER_CAN_NOT_DELETE, bgColor: ModalBgColorType.ERROR })
          return
        }
        setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }

  return { deleteFighter, isLoading, isError, isSuccess }
}
