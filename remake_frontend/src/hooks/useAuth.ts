import { useCallback } from "react"
import { queryKeys } from "@/assets/queryKeys"
import { Axios } from "@/assets/axios"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { MESSAGE, BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal"
// import { useNavigate } from "react-router-dom";
// ! recoil
import { useRecoilState, useSetRecoilState } from "recoil"
import { loadingState, loadingSelector } from "@/store/loadingState"
import { userSelector } from "@/store/userState"
// !hooks
import { useToastModal } from "./useToastModal"
import { useLoading } from "./useLoading"
//! types
import type { UserType } from "@/assets/types"
import { loginModalSelector } from "@/store/loginModalState"
// //! message contoller
// import { useToastModal, ModalBgColorType } from "./useToastModal";
// import { MESSAGE } from "@/libs/utils";


//! custom hooks
// import { useFetchMatchPredictVote } from "@/libs/hooks/useMatchPredict"
// import { useQueryState } from "@/libs/hooks/useQueryState"

// export enum AuthIs {
//   TRUE = "TRUE",
//   FALSE = "FALSE",
//   UNDEFINED = "UNDEFINED"
// }

// export type AuthUserStateType = {
//   auth: {
//     user: UserType,
//     hasAuth: AuthIs,
//     pending: boolean,
//     error: boolean
//   }
//   login: {
//     pending: boolean,
//     error: boolean
//   }
//   logout: {
//     pending: boolean,
//     error: boolean
//   }
// }

// type LoginPropsType = {
//   email: string,
//   password: string
// }


//! authチェック
export const useAuth = () => {

  const api = useCallback(async () => {
    try {
      const res = await Axios.get(`/api/user`).then(value => value.data)
      return res
    } catch (error) {
      return null
    }
  }, [])
  const { data, isLoading, isError } = useQuery<UserType>(queryKeys.auth, api, {
    retry: false,
    staleTime: Infinity
  })

  return { data, isLoading, isError }
}

//! ユーザ作成
// export const useCreateUser = () => {

//   type ApiPropsType = {
//     name: string,
//     email: string,
//     password: string
//   }
//   const { setter: setIsOpenSignUpModal } = useQueryState<boolean>("q/isOpenSignUpModal")
//   const { setToastModalMessage } = useToastModal()
//   const api = useCallback(async ({ name, email, password }: ApiPropsType) => {
//     return await Axios.post(`/api/user/create`, { name, email, password }).then(value => value.data)
//   }, [])
//   const { mutate, isLoading, isSuccess } = useMutation(api)
//   const createUser = ({ name, email, password }: ApiPropsType) => {
//     mutate({ name, email, password }, {
//       onSuccess: () => {
//         setToastModalMessage({ message: MESSAGE.USER_REGISTER_SUCCESSFULLY, bgColor: ModalBgColorType.SUCCESS })
//         setIsOpenSignUpModal(false)
//       },
//       onError: (error: any) => {
//         if (error.data.message === 'user already exists') {
//           setToastModalMessage({ message: MESSAGE.USER_ALREADY_EXIST, bgColor: ModalBgColorType.NOTICE })
//           return
//         }
//         if (error.data.message === 'name already use') {
//           setToastModalMessage({ message: MESSAGE.USER_NAME_ALREADY_USE, bgColor: ModalBgColorType.NOTICE })
//           return
//         }
//         setToastModalMessage({ message: MESSAGE.USER_REGISTER_FAILED, bgColor: ModalBgColorType.ERROR })
//       }
//     })
//   }
//   return { createUser, isLoading, isSuccess }
// }

//! ログイン
export const useLogin = () => {

  const { setToastModal, showToastModal } = useToastModal()

  const { resetLoadingState, startLoading, hasError, successful, endLoading } = useLoading()
  const [, setLoginModalState] = useRecoilState(loginModalSelector)
  const [, setUserState] = useRecoilState(userSelector)

  /**
   * ! Recoil
   * ? login modal を非表示にする
   * @returns {void}
   */
  const hideLoginModal = () => {
    setLoginModalState(false)
  }

  const api = useCallback(async (props: { email: string, password: string }) => {
    const res = await Axios.post<UserType>("api/login", { ...props }).then(value => value.data)
    return res
  }, [])
  const { mutate, isLoading, isSuccess, isError } = useMutation(api, {
    onMutate: () => {
      startLoading()
      console.log("loading");
    }
  })
  const login = (props: { email: string, password: string }) => {
    resetLoadingState()
    mutate({ ...props }, {
      // ! ログイン成功時
      onSuccess: (userData) => {
        console.log("ログイン成功");
        setUserState(userData)
        successful()
        setToastModal({ message: MESSAGE.LOGIN_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
        showToastModal()
        hideLoginModal()
      },
      // ! ログイン失敗時
      onError: () => {
        console.log("ログイン失敗");
        hasError()
        setToastModal({ message: MESSAGE.LOGIN_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
      }
    })
  }
  return { login, isLoading, isSuccess }
}
//! ログアウト
export const useLogout = () => {
  const { setToastModal, showToastModal } = useToastModal()
  const { resetLoadingState, startLoading, hasError, successful, endLoading } = useLoading()

  const api = useCallback(async ({ userId }: { userId: string }) => {
    await Axios.post<void>("api/logout", { user_id: userId }).then(value => value.data)
  }, [])

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      startLoading()
    }
  })
  const logout = useCallback(({ userId }: { userId: string }) => {
    mutate({ userId }, {
      onSuccess: () => {
        console.log("logoug error");
        successful()
        setToastModal({ message: MESSAGE.LOGOUT_SUCCESS, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
        showToastModal()
        // //? ユーザの勝敗予想データのキャッシュを削除
        // queryClient.setQueryData(queryKeys.vote, [])
        // //? auth を削除
        // queryClient.setQueryData<boolean>(queryKeys.auth, false)
        // navigate("/")
        resetLoadingState()
      },
      onError: () => {
        console.log("logoug error");
        hasError()
        setToastModal({ message: MESSAGE.LOGOUT_FAILED, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
        showToastModal()
        resetLoadingState()
      }
    })
  }, [])
  return { logout, isLoading, isSuccess }
}