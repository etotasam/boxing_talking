import { useCallback, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "@/assets/axios"
// ! data
import { QUERY_KEY } from "@/assets/queryKeys"
// import {  } from "@/components/module/BoxerEditForm";
// import { useLocation, useNavigate } from "react-router-dom";
// //! message contoller
// // import { useToastModal, ModalBgColorType } from "./useToastModal";
// // import { MESSAGE, STATUS } from "@/libs/utils";
// //! types
import type { NationalityType, BoxerType } from "@/assets/types"

// //! 選手データ
// export const Stance = {
//   Southpaw: "southpaw",
//   Orthodox: "orthodox",
// } as const

// export const Nationality = {
//   Japan: "Japan",
//   Mexico: "Mexico",
//   USA: "USA",
//   Kazakhstan: "Kazakhstan",
//   UK: "UK",
//   Rusia: "Rusia",
//   Philpin: "Philpin",
//   Ukrine: "Ukrine",
//   Canada: "Canada",
//   Venezuela: "Venezuela",
//   Puerto_rico: "Puerto_rico"
// } as const

// //! 選手データ取得 and 登録済み選手の数を取得
// export const limit = 10
// export const useFetchFighters = () => {

//   type SearchWordType = {
//     name?: string | undefined | null,
//     country?: NationalityType | undefined | null
//   }
//   type FetcherPropsType = {
//     page: number,
//     limit: number,
//     searchWords: SearchWordType | undefined
//   }

//   //? params の取得
//   const { search } = useLocation();
//   const query = new URLSearchParams(search);
//   let paramPage = Number(query.get("page"));
//   const paramName = (query.get("name"));
//   const paramCountry = (query.get("country")) as NationalityType | null;
//   if (!paramPage) {
//     paramPage = 1
//   }
//   const fetchFightersApi = async ({ page, limit, searchWords }: FetcherPropsType) => {
//     const res = await Axios.get<BoxerType[]>(QUERY_KEY.boxer, { params: { page, limit, ...searchWords } }).then(value => value.data)
//     return res
//   }
//   const { data, isLoading, isError, isPreviousData, refetch, isRefetching } = useQuery<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }], () => fetchFightersApi({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), { keepPreviousData: true, staleTime: Infinity })

//   const fetchFightersCount = async (searchWords: SearchWordType) => await Axios.get<number>(queryKeys.countFighter, { params: { ...searchWords } }).then(v => v.data)
//   const { data: count } = useQuery<number>(queryKeys.countFighter, () => fetchFightersCount({ name: paramName, country: paramCountry }), { staleTime: Infinity })
//   return { data, count, isLoading, isError, isPreviousData, refetch, isRefetching }
// }

// //! 選手データ更新
// export const useUpdateFighter = () => {
//   const queryClient = useQueryClient()
//   //? params page の取得
//   const { search } = useLocation();
//   const query = new URLSearchParams(search);
//   let paramPage = Number(query.get("page"));
//   const { setToastModalMessage } = useToastModal()
//   const snapshotFighters = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }])
//   const api = async (updateFighterData: BoxerType): Promise<Record<string, string> | void> => {
//     try {
//       //? 編集した選手データを含めた全選手データ
//       const updateFightersData = snapshotFighters?.reduce((acc: BoxerType[], curr: BoxerType) => {
//         if (curr.id === updateFighterData.id) {
//           return [...acc, updateFighterData];
//         }
//         return [...acc, curr];
//       }, []);
//       await Axios.put(QUERY_KEY.boxer, updateFighterData);
//       queryClient.setQueryData([QUERY_KEY.boxer, { page: paramPage }], updateFightersData)
//       setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: ModalBgColorType.SUCCESS });
//     } catch (error) {
//       console.error("選手データ更新:", error);
//       queryClient.setQueryData([QUERY_KEY.boxer, { page: paramPage }], snapshotFighters)
//       setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: ModalBgColorType.ERROR });
//     }
//   }
//   const { mutate, isLoading, isSuccess } = useMutation(api)
//   const updateFighter = (updateFighterdata: BoxerType) => {
//     mutate(updateFighterdata)
//   }
//   return { updateFighter, isLoading, isSuccess }
// }

// //! 選手登録
export const useRegisterBoxer = () => {
  const queryClient = useQueryClient()
  // const { count: fightersCount } = useFetchFighters()
  // const { setToastModalMessage, clearToastModaleMessage } = useToastModal()
  const api = useCallback(async (newBoxerData: BoxerType) => {
    const res = await Axios.post("/api/boxer", newBoxerData).then(v => v.data)
    return res
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: async () => {
      console.log("onMutate");
      // clearToastModaleMessage()
      // const isLeeway = fightersCount ? !!(fightersCount % limit) : false
      // const pageCount = fightersCount ? Math.ceil(fightersCount / limit) : 1
      // return { isLeeway, pageCount }
    }
  })
  const registerBoxer = (newBoxerData: BoxerType) => {
    mutate(newBoxerData, {
      onSuccess: (__, newBoxerData, context) => {
        console.log("onSuccess");
        // setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_SUCCESS, bgColor: ModalBgColorType.SUCCESS })
        // queryClient.setQueryData<number>(queryKeys.countFighter, (prev) => prev! + 1)
        // if (context.isLeeway) {
        //   const fightersData = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: context.pageCount }])
        //   if (fightersData?.length) {
        //     queryClient.setQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: context.pageCount }], [...fightersData, newBoxerData])
        //   }
        // } else {
        //   queryClient.setQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: context.pageCount++ }], [newBoxerData])
        // }
        // //? 選手数を更新
        // queryClient.setQueryData<number>(queryKeys.countFighter, (prevFightersCount) => {
        //   return prevFightersCount! ++
        // })
        // queryClient.invalidateQueries(QUERY_KEY.boxer)
      },
      onError: (error: any) => {
        console.log("onError");
        // if (error.status === STATUS.NOT_ACCEPTABLE) {
        //   setToastModalMessage({ message: MESSAGE.FIGHTER_NOT_ABLE_TO_REGISTER, bgColor: ModalBgColorType.ERROR })
        //   return
        // }
        // setToastModalMessage({ message: MESSAGE.FIGHTER_REGISTER_FAILD, bgColor: ModalBgColorType.ERROR })
      }
    })
  }
  return { registerBoxer, isLoading, isError, isSuccess }
}

// //! 選手データ削除
// export const useDeleteFighter = () => {
//   const queryClient = useQueryClient()

//   const navigate = useNavigate()
//   const { setToastModalMessage } = useToastModal()
//   //? 選手の数を取得
//   const { count: fightersCount } = useFetchFighters()
//   //? page数を計算
//   const [pageCount, setPageCount] = useState<number>(0)
//   useEffect(() => {
//     if (!fightersCount) return
//     const pages = Math.ceil(fightersCount / limit)
//     setPageCount(pages)
//   }, [fightersCount])

//   //? paramsを取得
//   const { search } = useLocation();
//   const query = new URLSearchParams(search);
//   const paramPage = Number(query.get("page"));

//   const api = async (fighterData: BoxerType) => await Axios.delete(QUERY_KEY.boxer, { data: { fighterId: fighterData.id } }).then(v => v.data)
//   const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
//     onMutate: (fighterData) => {
//       const snapshotFighters = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }])
//       const widtoutDeleteFighters = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }])!.filter(fighter => fighter.id !== fighterData.id)
//       return { snapshotFighters, widtoutDeleteFighters }
//     }
//   })
//   const deleteFighter = (fighterData: BoxerType) => {
//     mutate(fighterData, {
//       onSuccess: async (data, fighterData, context) => {
//         setToastModalMessage({ message: MESSAGE.FIGHTER_DELETED, bgColor: ModalBgColorType.SUCCESS })
//         queryClient.setQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }], context.widtoutDeleteFighters)
//         if (!context.widtoutDeleteFighters.length) {
//           if (paramPage > 1) {
//             navigate(`/fighter/edit?page=${paramPage - 1}`)
//           }
//         }

//         //? 選手数を更新
//         queryClient.setQueryData<number>(queryKeys.countFighter, (prev) => prev! - 1)
//         //? 削除した選手より後のpage情報は再取得させる
//         const pages = [...Array(pageCount + 1)].map((_, num) => num).filter(n => n >= paramPage)
//         pages.forEach((page) => {
//           queryClient.removeQueries([QUERY_KEY.boxer, { page }], { exact: true })
//         })
//         queryClient.setQueryData(QUERY_KEY.boxerEditData, initialFighterInfoState)
//       },
//       onError: (error: any) => {
//         if (error.status === STATUS.NOT_ACCEPTABLE) {
//           setToastModalMessage({ message: MESSAGE.FIGHTER_CAN_NOT_DELETE, bgColor: ModalBgColorType.ERROR })
//           return
//         }
//         setToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: ModalBgColorType.ERROR })
//       }
//     })
//   }

//   return { deleteFighter, isLoading, isError, isSuccess }
// }
