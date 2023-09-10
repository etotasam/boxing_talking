import { useCallback, useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Axios } from "@/assets/axios"
// ! data
import { QUERY_KEY } from "@/assets/queryKeys"
import { ERROR_MESSAGE_FROM_BACKEND } from "@/assets/errorMessageFromBackend";
// import {  } from "@/components/module/BoxerEditForm";
// ! recoil
// import { useSetRecoilState } from "recoil"
// import {loadingSelector} from "@/store/loadingState"
// //! hooks
import { useReactQuery } from "./useReactQuery";
import { useLoading } from "./useLoading"
import { useToastModal } from "./useToastModal";
import { MESSAGE, STATUS, BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal";
// //! types
import type { BgColorType, BoxerDataOnFormType, BoxerType, NationalityType } from "@/assets/types"
// ! functions
import { convertToBoxerData } from "@/assets/functions";


//! 選手データ取得 and 登録済み選手の数を取得
export const limit = 15
export const useFetchBoxer = () => {

  type SearchWordType = {
    name?: string | null
    country?: NationalityType | null
  }
  type FetcherPropsType = {
    page: number,
    limit: number,
    searchWords: SearchWordType | undefined
  }

  //? params の取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramName = (query.get("name"));
  const paramCountry = (query.get("country")) as NationalityType | null;
  let paramPage = Number(query.get("page"));

  if (!paramPage) {
    paramPage = 1
  }
  let queryKey: Record<string, string | number> = { page: paramPage }

  if (paramName) {
    queryKey = { ...queryKey, name: paramName }
  }
  if (paramCountry) {
    queryKey = { ...queryKey, country: paramCountry }
  }



  const fetchBoxerApi = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<BoxerType[]>("/api/boxer", { params: { page, limit, ...searchWords } }).then(value => value.data)
    return res
  }
  const { data: boxersData, isLoading, isError, isPreviousData, refetch, isRefetching, } = useQuery<BoxerType[]>([QUERY_KEY.boxer, { ...queryKey }], () => fetchBoxerApi({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), {
    keepPreviousData: true, staleTime: Infinity, onSuccess: () => { }, onError: () => { }
  })

  const fetchCountBoxer = async (searchWords: SearchWordType) => await Axios.get<number>("/api/boxer/count", { params: { ...searchWords } }).then(v => v.data)
  const { data: boxersCount } = useQuery<number>([QUERY_KEY.countBoxer, { name: paramName, country: paramCountry }], () => fetchCountBoxer({ name: paramName, country: paramCountry }), { staleTime: Infinity })
  const pageCount = boxersCount ? Math.ceil(boxersCount / limit) : 0

  return { boxersData, boxersCount, pageCount, isLoading, isError, isPreviousData, refetch, isRefetching }
}

// //! 選手データ更新
export const useUpdateBoxerData = () => {
  const { startLoading, resetLoadingState, successful, hasError } = useLoading()
  const { refetchReactQueryData } = useReactQuery()
  // const queryClient = useQueryClient()
  //? params page の取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));
  const { setToastModal, showToastModal } = useToastModal()
  // const snapshotFighters = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }])
  const api = async (updateFighterData: BoxerType): Promise<Record<string, string> | void> => {
    // try {
    //? 編集した選手データを含めた全選手データ
    // const updateFightersData = snapshotFighters?.reduce((acc: BoxerType[], curr: BoxerType) => {
    //   if (curr.id === updateFighterData.id) {
    //     return [...acc, updateFighterData];
    //   }
    //   return [...acc, curr];
    // }, []);
    await Axios.put("/api/boxer", updateFighterData);
    // queryClient.setQueryData([QUERY_KEY.boxer, { page: paramPage }], updateFightersData)
    //   setToastModal({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS });
    //   showToastModal()
    // } catch (error) {
    //   console.error("選手データ更新:", error);
    // queryClient.setQueryData([QUERY_KEY.boxer, { page: paramPage }], snapshotFighters)
    //   setToastModal({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR });
    //   showToastModal()
    // }
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: async () => {
      console.log("選手データ更新");
      startLoading()
      // clearToastModaleMessage()
      // const isLeeway = fightersCount ? !!(fightersCount % limit) : false
      // const pageCount = fightersCount ? Math.ceil(fightersCount / limit) : 1
      // return { isLeeway, pageCount }
    }
  })
  const updateFighter = (updateFighterData: BoxerDataOnFormType) => {
    const convertedBoxerData = convertToBoxerData(updateFighterData)
    mutate(convertedBoxerData, {
      onSuccess: () => {
        refetchReactQueryData(QUERY_KEY.boxer)
        resetLoadingState()
        setToastModal({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS });
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR });
        showToastModal()
      }
    })
  }
  return { updateFighter, isLoading, isSuccess }
}

// //! 選手登録
export const useRegisterBoxer = () => {
  const { refetchReactQueryData } = useReactQuery()
  const { startLoading, resetLoadingState, successful, hasError } = useLoading()
  const { showToastModal } = useToastModal()
  // const { count: fightersCount } = useFetchBoxer()
  const { setToastModal, resetToastModalToDefault } = useToastModal()
  const api = useCallback(async (newBoxerData: BoxerType) => {
    const res = await Axios.post("/api/boxer", newBoxerData).then(v => v.data)
    return res
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: async () => {
      startLoading()
      // clearToastModaleMessage()
      // const isLeeway = fightersCount ? !!(fightersCount % limit) : false
      // const pageCount = fightersCount ? Math.ceil(fightersCount / limit) : 1
      // return { isLeeway, pageCount }
    }
  })
  const registerBoxer = (newBoxerData: BoxerDataOnFormType) => {
    const convetedBoxerData = convertToBoxerData(newBoxerData)
    mutate(convetedBoxerData, {
      onSuccess: (__, newBoxerData, context) => {
        successful()
        resetLoadingState()
        setToastModal({ message: MESSAGE.FIGHTER_REGISTER_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        refetchReactQueryData(QUERY_KEY.boxer)
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
        hasError()
        resetLoadingState()
        if (error.status === STATUS.NOT_ACCEPTABLE) {
          setToastModal({ message: MESSAGE.BOXER_IS_ALRADY_EXISTS, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          showToastModal()
          return
        }
        setToastModal({ message: MESSAGE.FIGHTER_REGISTER_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }
  return { registerBoxer, isLoading, isError, isSuccess }
}

// //! 選手データ削除
export const useDeleteBoxer = () => {
  const queryClient = useQueryClient()
  const { refetch: RefetchBoxerData, isRefetching } = useFetchBoxer()
  const { startLoading, resetLoadingState, successful, hasError } = useLoading()
  const { setToastModal, showToastModal, resetToastModalToDefault } = useToastModal()

  const navigate = useNavigate()
  //? 選手の数を取得
  const { pageCount } = useFetchBoxer()
  //? page数を計算

  //? paramsを取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));
  //? api
  const api = async (boxerData: BoxerType | BoxerDataOnFormType) => {
    // try {
    await Axios.delete('/api/boxer', { data: { boxer_id: boxerData.id, eng_name: boxerData.eng_name } }).then(v => v.data)
    // resetLoadingState()
    // setToastModal({ message: MESSAGE.FIGHTER_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
    // showToastModal()
    // } catch (error: any) {
    //   console.error("エラー", error);
    //   resetLoadingState()
    //   if (error.status === STATUS.NOT_ACCEPTABLE) {
    //     setToastModal({ message: MESSAGE.FIGHTER_CAN_NOT_DELETE, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
    //     showToastModal()
    //     return
    //   }
    //   setToastModal({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
    //   showToastModal()
    // }
  }

  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: (boxerData) => {
      startLoading()
      console.log("削除中");
      // const snapshotFighters = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }])
      // const widtoutDeleteFighters = queryClient.getQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }])!.filter(fighter => fighter.id !== boxerData.id)
      // return { snapshotFighters, widtoutDeleteFighters }
    }
  })
  const deleteBoxer = (boxerData: BoxerType | BoxerDataOnFormType) => {
    mutate(boxerData, {
      onSuccess: async (data, boxerData, context) => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.BOXER_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()

        // queryClient.setQueryData<BoxerType[]>([QUERY_KEY.boxer, { page: paramPage }], context.widtoutDeleteFighters)
        // if (!context.widtoutDeleteFighters.length) {
        //   if (paramPage > 1) {
        //     navigate(`/fighter/edit?page=${paramPage - 1}`)
        //   }
        // }

        //? 選手データと選手数をリフェッチ
        RefetchBoxerData()
        // queryClient.setQueryData<number>(queryKeys.countFighter, (prev) => prev! - 1)
        //   //? 削除した選手より後のpage情報は再取得させる
        //   const pages = [...Array(pageCount + 1)].map((_, num) => num).filter(n => n >= paramPage)
        // pages.forEach((page) => {
        //   queryClient.removeQueries([QUERY_KEY.boxer, { page }], { exact: true })
        // })
        //   queryClient.setQueryData(QUERY_KEY.boxerEditData, initialFighterInfoState)
      },
      onError: (error: any) => {
        resetLoadingState()
        if (error.status === STATUS.NOT_ACCEPTABLE) {
          const errorMessage = error.data.message
          if (errorMessage === ERROR_MESSAGE_FROM_BACKEND.BOXER_NOT_EXIST_IN_DB || errorMessage === ERROR_MESSAGE_FROM_BACKEND.REQUEST_DATA_IS_NOT_MATCH_BOXER_IN_DB) {
            setToastModal({ message: MESSAGE.ILLEGAL_DATA, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          }
          if (errorMessage === ERROR_MESSAGE_FROM_BACKEND.BOXER_HAS_ALRADY_SETUP_MATCH) {
            setToastModal({ message: MESSAGE.BOXER_IS_ALRADY_SETUP_MATCH, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
            showToastModal()
          }
          showToastModal()
          return
        }
        setToastModal({ message: MESSAGE.FIGHTER_EDIT_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        return
      }
    })
  }

  return { deleteBoxer, isLoading, isError, isSuccess }
}