import { useCallback } from "react"
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "react-query"
import { Axios } from "@/assets/axios"
import { API_PATH } from "@/assets/apiPath"
// ! data
import { QUERY_KEY } from "@/assets/queryKeys"
// //! hooks
import { useReactQuery } from "../useReactQuery";
import { useFullScreenLoading } from "../useFullScreenLoading";
import { useToastModal } from "../useToastModal";
import { MESSAGE } from "@/assets/statusesOnToastModal";
// //! types
import type { BoxerType, CountryType } from "@/types"


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
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  const { refetchReactQueryArrayKeys } = useReactQuery()
  //? params page の取得
  const { showErrorToast, showSuccessToast } = useToastModal()
  const api = async (updateFighterData: Pick<BoxerType, 'id'> & Partial<BoxerType>): Promise<void> => {
    await Axios.patch<void>(API_PATH.BOXER, updateFighterData);
  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: async () => {
      showFullScreenLoading()
    },
    onSuccess: () => {
      hideFullScreenLoading()
      refetchReactQueryArrayKeys([QUERY_KEY.FETCH_MATCHES, QUERY_KEY.BOXER])
      showSuccessToast(MESSAGE.FIGHTER_EDIT_SUCCESS)
    },
    onError: (error: any) => {
      hideFullScreenLoading()
      if (error.data.errorCode === 30) {
        showErrorToast(error.data.message)
        return
      }
      showErrorToast(MESSAGE.FIGHTER_EDIT_FAILED)
    },
  })

  const updateBoxer = (updateFighterData: Pick<BoxerType, 'id'> & Partial<BoxerType>) => {
    mutate(updateFighterData,)
  }
  return { updateBoxer, isLoading, isSuccess }
}

// //! boxer登録
export const useRegisterBoxer = () => {
  const { refetchReactQueryData } = useReactQuery()
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  const { showSuccessToast, showErrorToast } = useToastModal()
  const api = useCallback(async (newBoxerData: Omit<BoxerType, "id">): Promise<void> => {
    await Axios.post<void>(API_PATH.BOXER, newBoxerData).then(v => v.data)
    // return res
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: async () => {
      showFullScreenLoading()
    }
  })
  const registerBoxer = (newBoxerData: Omit<BoxerType, "id">) => {
    // const convertedBoxerDataBoxerData = convertToBoxerData(newBoxerData)
    mutate(newBoxerData, {
      onSuccess: () => {
        hideFullScreenLoading()
        showSuccessToast(MESSAGE.FIGHTER_REGISTER_SUCCESS)
        refetchReactQueryData(QUERY_KEY.BOXER)
      },
      onError: (error: any) => {
        hideFullScreenLoading()
        if (error.status === 422) {
          const errors = error.data.message as any
          if (errors.name) {
            if ((errors.name as string[]).includes('name is already exists')) {
              showErrorToast(MESSAGE.BOXER_IS_ALREADY_EXISTS)
              return
            }
          }

          if (errors.eng_name) {
            if ((errors.eng_name as string[]).includes('eng_name is already exists')) {
              showErrorToast(MESSAGE.BOXER_IS_ALREADY_EXISTS)
              return
            }
          }
        }
        showErrorToast(MESSAGE.FIGHTER_REGISTER_FAILED)
      }
    })
  }
  return { registerBoxer, isLoading, isError, isSuccess }
}

// //! boxerデータ削除
export const useDeleteBoxer = () => {
  const { refetch: RefetchBoxerData } = useFetchBoxers()
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading()
  const { showErrorToast, showSuccessToast } = useToastModal()

  //? api
  const api = async (boxerData: BoxerType): Promise<void> => {
    await Axios.delete<void>(API_PATH.BOXER, { data: { boxerId: boxerData.id, engName: boxerData.engName } }).then(v => v.data)
  }

  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading()
    }
  })
  const deleteBoxer = (boxerData: BoxerType) => {
    mutate(boxerData, {
      onSuccess: async () => {
        hideFullScreenLoading()
        showSuccessToast(MESSAGE.BOXER_DELETED)
        //? 選手データと選手数をリフェッチ
        RefetchBoxerData()
      },
      onError: (error: any) => {
        hideFullScreenLoading()
        const errorCode = error.data.errorCode
        if (errorCode === 30) {
          showErrorToast(MESSAGE.BOXER_IS_ALREADY_SETUP_MATCH)
          return
        }
        if (errorCode === 44) {
          showErrorToast(MESSAGE.ILLEGAL_DATA)
          return
        }
        if (errorCode === 50) {
          showErrorToast(MESSAGE.FAILED_DELETE_BOXER)
          return
        }
        showErrorToast(MESSAGE.FIGHTER_EDIT_FAILED)
        return
      }
    })
  }

  return { deleteBoxer, isLoading, isError, isSuccess }
}