import { useCallback } from "react"
import { useMutation } from "react-query"
import { useSetRecoilState } from "recoil"
import { authenticatingSelector } from "@/store/authenticatingState"
import { Axios } from "@/assets/axios"
import { tokenErrorMessageSelector } from "@/store/tokenErrorMessageState"
import { tokenErrorMessages } from "@/assets/tokenErrorMessage"


//! ユーザ登録（本登録）
export const useSignUpIdentification = () => {
  // ? react query
  const setAuthenticatingState = useSetRecoilState(authenticatingSelector)
  const setTokenErrorMessage = useSetRecoilState(tokenErrorMessageSelector)

  const api = useCallback(async ({ token }: { token: string }) => {
    try {
      const res = await Axios.post<boolean>(`/api/user/create`, { token }).then(value => value.data)
      setAuthenticatingState({ isLoading: false, isError: false, isSuccess: true })
      return res
    } catch (error: any) {
      const errorMessage = error.data.message
      if (errorMessage === "Expired token") {
        setTokenErrorMessage(tokenErrorMessages.EXPIRED_TOKEN)
      }
      setAuthenticatingState({ isLoading: false, isError: true, isSuccess: false })
    }
  }, [])
  const { mutate } = useMutation(api, {
    onMutate: () => {
      setAuthenticatingState({ isLoading: true, isError: false, isSuccess: false })
    }
  })
  const createUser = ({ token }: { token: string }) => {
    mutate({ token }, {
      onSuccess: () => {
      },

      onError: () => {
      }
    })
  }
  return { createUser }
}