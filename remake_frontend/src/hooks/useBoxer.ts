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
import type { BoxerDataOnFormType, BoxerType, NationalityType } from "@/assets/types"
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



  const fetchBoxerAPI = async ({ page, limit, searchWords }: FetcherPropsType) => {
    const res = await Axios.get<BoxerType[]>("/api/boxer", { params: { page, limit, ...searchWords } }).then(value => value.data)
    return res
  }
  const { data: boxersData, isLoading, isError, isPreviousData, refetch, isRefetching, } = useQuery<BoxerType[]>([QUERY_KEY.boxer, { ...queryKey }], () => fetchBoxerAPI({ page: paramPage, limit, searchWords: { name: paramName, country: paramCountry } }), {
    keepPreviousData: true, staleTime: Infinity, onSuccess: () => { }, onError: () => { }
  })

  const fetchCountBoxerAPI = async (searchWords: SearchWordType) => await Axios.get<number>("/api/boxer/count", { params: { ...searchWords } }).then(v => v.data)
  const { data: boxersCount } = useQuery<number>([QUERY_KEY.countBoxer, { name: paramName, country: paramCountry }], () => fetchCountBoxerAPI({ name: paramName, country: paramCountry }), { staleTime: Infinity })
  const pageCount = boxersCount ? Math.ceil(boxersCount / limit) : 0

  return { boxersData, boxersCount, pageCount, isLoading, isError, isPreviousData, refetch, isRefetching }
}

// //! 選手データ更新
export const useUpdateBoxerData = () => {
  const { startLoading, resetLoadingState } = useLoading()
  const { refetchReactQueryData } = useReactQuery()
  //? params page の取得
  const { setToastModal, showToastModal } = useToastModal()
  const api = async (updateFighterData: BoxerType): Promise<Record<string, string> | void> => {
    await Axios.put("/api/boxer", updateFighterData);

  }
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: async () => {
      startLoading()
    }
  })
  const updateFighter = (updateFighterData: BoxerDataOnFormType) => {
    const convertedBoxerData = convertToBoxerData(updateFighterData)
    mutate(convertedBoxerData, {
      onSuccess: () => {
        refetchReactQueryData(QUERY_KEY.boxer)
        refetchReactQueryData(QUERY_KEY.matchesFetch)
        resetLoadingState()
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
  const { startLoading, resetLoadingState, successful, hasError } = useLoading()
  const { showToastModal } = useToastModal()
  // const { count: fightersCount } = useFetchBoxer()
  const { setToastModal } = useToastModal()
  const api = useCallback(async (newBoxerData: BoxerType) => {
    const res = await Axios.post("/api/boxer", newBoxerData).then(v => v.data)
    return res
  }, []);
  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: async () => {
      startLoading()
    }
  })
  const registerBoxer = (newBoxerData: BoxerDataOnFormType) => {
    const convetedBoxerData = convertToBoxerData(newBoxerData)
    mutate(convetedBoxerData, {
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
          const errors = error.data.errors as any
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

        setToastModal({ message: MESSAGE.FIGHTER_REGISTER_FAILD, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
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
  const api = async (boxerData: BoxerType | BoxerDataOnFormType) => {
    // try {
    await Axios.delete('/api/boxer', { data: { boxer_id: boxerData.id, eng_name: boxerData.eng_name } }).then(v => v.data)

  }

  const { mutate, isLoading, isError, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const deleteBoxer = (boxerData: BoxerType | BoxerDataOnFormType) => {
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