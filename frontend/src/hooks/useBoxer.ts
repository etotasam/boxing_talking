import { useCallback } from "react"
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "react-query"
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
import type { BoxerType, NationalityType } from "@/assets/types"
// ! functions
// import { convertToBoxerData } from "@/assets/functions";


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

  const fetchBoxerAPI = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<{ boxers: BoxerType[], count: number }>("/api/boxer", { params: { page, limit, ...searchWords } }).then(value => value.data)
    return res
  }
  const { data: result, isLoading, isError, isPreviousData, refetch, isRefetching, } = useQuery<{ boxers: BoxerType[], count: number }>([QUERY_KEY.boxer, { ...queryKey }], () => fetchBoxerAPI({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), {
    keepPreviousData: true, staleTime: Infinity, onSuccess: () => { }, onError: () => { }
  })

  let boxersData
  let boxersCount
  if (result) {
    boxersData = result.boxers
    boxersCount = result.count
  }
  const pageCount = boxersCount ? Math.ceil(boxersCount / limit) : 0

  return { boxersData, boxersCount, pageCount, isLoading, isError, isPreviousData, refetch, isRefetching }
}

// //! 選手データ更新
export const useUpdateBoxerData = () => {
  const { startLoading, resetLoadingState } = useLoading()
  const { refetchReactQueryArrayKeys, refetchReactQueryData } = useReactQuery()
  //? params page の取得
  const { setToastModal, showToastModal } = useToastModal()
  const api = async (updateFighterData: BoxerType): Promise<void> => {
    await Axios.put<void>("/api/boxer", updateFighterData);
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: async () => {
      startLoading()
    }
  })
  const updateFighter = (updateFighterData: BoxerType) => {
    // const convertedBoxerData = convertToBoxerData(updateFighterData)
    mutate(updateFighterData, {
      onSuccess: () => {
        resetLoadingState()
        refetchReactQueryArrayKeys([QUERY_KEY.matchesFetch, QUERY_KEY.boxer])
        setToastModal({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS });
        showToastModal()
      },
      onError: () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.FIGHTER_EDIT_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR });
        showToastModal()
      }
    })
  }
  return { updateFighter, isLoading, isSuccess }
}

// //! 選手登録
export const useRegisterBoxer = () => {
  const { refetchReactQueryData } = useReactQuery()
  const { startLoading, resetLoadingState, successful } = useLoading()
  const { showToastModal } = useToastModal()
  // const { count: fightersCount } = useFetchBoxer()
  const { setToastModal } = useToastModal()
  const api = useCallback(async (newBoxerData: Omit<BoxerType, "id">): Promise<void> => {
    await Axios.post<void>("/api/boxer", newBoxerData).then(v => v.data)
    // return res
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: async () => {
      startLoading()
    }
  })
  const registerBoxer = (newBoxerData: Omit<BoxerType, "id">) => {
    // const convertedBoxerDataBoxerData = convertToBoxerData(newBoxerData)
    mutate(newBoxerData, {
      onSuccess: () => {
        successful()
        resetLoadingState()
        setToastModal({ message: MESSAGE.FIGHTER_REGISTER_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        refetchReactQueryData(QUERY_KEY.boxer)
      },
      onError: (error: any) => {
        resetLoadingState()
        if (error.status === 422) {
          const errors = error.data.message as any
          if (errors.name) {
            if ((errors.name as string[]).includes('name is already exists')) {
              setToastModal({ message: MESSAGE.BOXER_IS_ALREADY_EXISTS, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              showToastModal()
              return
            }
          }

          if (errors.eng_name) {
            if ((errors.eng_name as string[]).includes('eng_name is already exists')) {
              setToastModal({ message: MESSAGE.BOXER_IS_ALREADY_EXISTS, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
              showToastModal()
              return
            }
          }
        }

        setToastModal({ message: MESSAGE.FIGHTER_REGISTER_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }
  return { registerBoxer, isLoading, isError, isSuccess }
}

// //! 選手データ削除
export const useDeleteBoxer = () => {
  // const queryClient = useQueryClient()
  const { refetch: RefetchBoxerData } = useFetchBoxer()
  const { startLoading, resetLoadingState } = useLoading()
  const { setToastModal, showToastModal } = useToastModal()

  // const navigate = useNavigate()
  //? 選手の数を取得
  // const { pageCount } = useFetchBoxer()
  //? page数を計算

  //? paramsを取得
  // const { search } = useLocation();
  // const query = new URLSearchParams(search);
  // const paramPage = Number(query.get("page"));
  //? api
  const api = async (boxerData: BoxerType): Promise<void> => {
    await Axios.delete<void>('/api/boxer', { data: { boxer_id: boxerData.id, eng_name: boxerData.eng_name } }).then(v => v.data)
  }

  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const deleteBoxer = (boxerData: BoxerType) => {
    mutate(boxerData, {
      onSuccess: async () => {
        resetLoadingState()
        setToastModal({ message: MESSAGE.BOXER_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        //? 選手データと選手数をリフェッチ
        RefetchBoxerData()
      },
      onError: (error: any) => {
        resetLoadingState()
        if (error.status === STATUS.NOT_ACCEPTABLE) {
          const errorMessage = error.data.message
          if (errorMessage === ERROR_MESSAGE_FROM_BACKEND.BOXER_NOT_EXIST_IN_DB || errorMessage === ERROR_MESSAGE_FROM_BACKEND.REQUEST_DATA_IS_NOT_MATCH_BOXER_IN_DB) {
            setToastModal({ message: MESSAGE.ILLEGAL_DATA, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          }
          if (errorMessage === ERROR_MESSAGE_FROM_BACKEND.BOXER_HAS_ALREADY_SETUP_MATCH) {
            setToastModal({ message: MESSAGE.BOXER_IS_ALREADY_SETUP_MATCH, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
            showToastModal()
          }
          showToastModal()
          return
        }
        setToastModal({ message: MESSAGE.FIGHTER_EDIT_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        return
      }
    })
  }

  return { deleteBoxer, isLoading, isError, isSuccess }
}