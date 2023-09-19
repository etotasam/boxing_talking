import { useCallback } from "react"
import { useMutation } from "react-query"
import { useSetRecoilState } from "recoil"
import { authenticatingSelector } from "@/store/authenticatingState"
import { Axios } from "@/assets/axios"


//! ユーザ登録（本登録）
export const useSignUpIdentification = () => {
  // ? react query
  const setAuthenticatingState = useSetRecoilState(authenticatingSelector)


  const api = useCallback(async ({ token }: { token: string }) => {
    const res = await Axios.post<boolean>(`/api/user/create`, { token }).then(value => value.data)
    return res
  }, [])
  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      setAuthenticatingState({ isLoading: true, isError: false, isSuccess: false })
    }
  })
  const createUser = ({ token }: { token: string }) => {
    mutate({ token }, {
      onSuccess: () => {
        setAuthenticatingState({ isLoading: false, isError: false, isSuccess: true })
      },

      onError: () => {
        setAuthenticatingState({ isLoading: false, isError: true, isSuccess: false })
      }
    })
  }
  return { createUser, isLoading, isSuccess }
}