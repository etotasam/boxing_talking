import { useCallback } from "react"
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "react-query"
import { Axios } from "@/assets/axios"
import { API_PATH } from "@/assets/apiPath"
// ! data
import { QUERY_KEY } from "@/assets/queryKeys"
// //! hooks
import { useReactQuery } from "../useReactQuery";
import { useLoading } from "../useLoading"
import { useToastModal } from "../useToastModal";
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal";
// //! types
import type { BoxerType, CountryType } from "@/assets/types"


//! boxerデータ取得 and 登録済み選手の数を取得
const limit = 15
export const useFetchBoxers = () => {

  type SearchWordType = {
    name?: string | null
    country?: CountryType | null
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
  const paramCountry = (query.get("country")) as CountryType | null;
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

  type ResponseType = {
    data: {
      boxers: BoxerType[],
      count: number
    }
  }

  const fetchBoxerAPI = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<ResponseType>(API_PATH.BOXER, { params: { page, limit, ...searchWords } }).then(result => result.data)
    return res.data
  }
  const { data: result, isLoading, isError, isPreviousData, refetch, isRefetching, } = useQuery<{
    boxers: BoxerType[],
    count: number
  }>([QUERY_KEY.BOXER, { ...queryKey }], () => fetchBoxerAPI({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), {
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

// //! boxerデータ更新
export const useUpdateBoxerData = () => {
  const { startLoading, resetLoadingState } = useLoading()
  const { refetchReactQueryArrayKeys } = useReactQuery()
  //? params page の取得
  const { showToastModalMessage } = useToastModal()
  const api = async (updateFighterData: Pick<BoxerType, 'id'> & Partial<BoxerType>): Promise<void> => {
    await Axios.patch<void>(API_PATH.BOXER, updateFighterData);
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: async () => {
      startLoading()
    }
  })
  const updateBoxer = (updateFighterData: Pick<BoxerType, 'id'> & Partial<BoxerType>) => {
    mutate(updateFighterData, {
      onSuccess: () => {
        resetLoadingState()
        refetchReactQueryArrayKeys([QUERY_KEY.FETCH_MATCHES, QUERY_KEY.BOXER])
        showToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS });
      },
      onError: () => {
        resetLoadingState()
        showToastModalMessage({ message: MESSAGE.FIGHTER_EDIT_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR });
      }
    })
  }
  return { updateBoxer, isLoading, isSuccess }
}

// //! boxer登録
export const useRegisterBoxer = () => {
  const { refetchReactQueryData } = useReactQuery()
  const { startLoading, resetLoadingState, successful } = useLoading()
  const { showToastModal } = useToastModal()
  const { setToastModal } = useToastModal()
  const api = useCallback(async (newBoxerData: Omit<BoxerType, "id">): Promise<void> => {
    await Axios.post<void>(API_PATH.BOXER, newBoxerData).then(v => v.data)
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
        refetchReactQueryData(QUERY_KEY.BOXER)
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

// //! boxerデータ削除
export const useDeleteBoxer = () => {
  const { refetch: RefetchBoxerData } = useFetchBoxers()
  const { startLoading, resetLoadingState } = useLoading()
  const { setToastModal, showToastModal, showToastModalMessage } = useToastModal()

  //? api
  const api = async (boxerData: BoxerType): Promise<void> => {
    await Axios.delete<void>(API_PATH.BOXER, { data: { boxerId: boxerData.id, engName: boxerData.engName } }).then(v => v.data)
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
        showToastModalMessage({ message: MESSAGE.BOXER_DELETED, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        //? 選手データと選手数をリフェッチ
        RefetchBoxerData()
      },
      onError: (error: any) => {
        resetLoadingState()
        const errorCode = error.data.errorCode
        if (errorCode === 30) {
          showToastModalMessage({ message: MESSAGE.BOXER_IS_ALREADY_SETUP_MATCH, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          return
        }
        if (errorCode === 44) {
          showToastModalMessage({ message: MESSAGE.ILLEGAL_DATA, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
          return
        }
        if (errorCode === 50) {
          showToastModalMessage({ message: MESSAGE.FAILED_DELETE_BOXER, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
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