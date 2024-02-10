import { useCallback } from "react"
// !Recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { loadingState } from "@/store/loadingState"
// !types



export const useLoading = () => {

  //? ToastModalの状態(show/hide)
  const loadingStateSetter = useSetRecoilState(loadingState)
  const { isLoading } = useRecoilValue(loadingState)

  /**
   * !Recoil
   * ?loadingStateをリセット
   * @returns {void}
   */
  const resetLoadingState = useCallback(() => {
    loadingStateSetter(() => {
      return { isError: false, isLoading: false, isSuccess: false }
    })
  }, [])
  /**
   * ! Recoil
   * ? isLoadingをtrueにセット
   * @returns {void}
   */
  const startLoading = useCallback(() => {
    loadingStateSetter((curr) => {
      return { ...curr, isLoading: true }
    })
  }, [])
  /**
   * ! Recoil
   * ? isLoadingをfalseにセット
   * @returns {void}
   */
  const endLoading = useCallback(() => {
    loadingStateSetter(curr => {
      return { ...curr, isLoading: false }
    })
  }, [])
  /**
   * ! Recoil
   * ? isSuccessをtrueにセット
   * @returns {void}
   */
  const successful = useCallback(() => {
    loadingStateSetter(curr => {
      return { ...curr, isLoading: false, isSuccess: true, isError: false }
    })
  }, [])
  /**
   * ! Recoil
   * ? isErrorをtrueにセット
   * @returns {void}
   */
  const hasError = useCallback(() => {
    loadingStateSetter(curr => {
      return { ...curr, isLoading: false, isSuccess: false, isError: true }
    })
  }, [])


  return { isLoading, resetLoadingState, startLoading, hasError, successful, endLoading }
}