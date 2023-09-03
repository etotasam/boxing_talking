// !Recoil
import { useSetRecoilState, } from "recoil"
import { loadingSelector } from "@/store/loadingState"
// !types



export const useLoading = () => {

  //? ToastModalの状態(show/hide)
  // const { isShow: isShowToastModal, message: messageOnToast, bgColor } = useRecoilValue(toastModalSelector)
  const loadingStateSetter = useSetRecoilState(loadingSelector)

  /**
   * !Recoil
   * ?loadingStateをリセット
   * @returns {void}
   */
  const resetLoadingState = () => {
    loadingStateSetter(() => {
      return { isError: undefined, isLoading: undefined, isSuccess: undefined }
    })
  }
  /**
   * ! Recoil
   * ? isLoadingをtrueにセット
   * @returns {void}
   */
  const startLoading = () => {
    loadingStateSetter((curr) => {
      return { ...curr, isLoading: true }
    })
  }
  /**
   * ! Recoil
   * ? isLoadingをfalseにセット
   * @returns {void}
   */
  const endLoading = () => {
    loadingStateSetter(curr => {
      return { ...curr, isLoading: false }
    })
  }
  /**
   * ! Recoil
   * ? isSuccessをtrueにセット
   * @returns {void}
   */
  const successful = () => {
    loadingStateSetter(curr => {
      return { ...curr, isLoading: false, isSuccess: true, isError: false }
    })
  }
  /**
   * ! Recoil
   * ? isErrorをtrueにセット
   * @returns {void}
   */
  const hasError = () => {
    loadingStateSetter(curr => {
      return { ...curr, isLoading: false, isSuccess: false, isError: true }
    })
  }


  return { resetLoadingState, startLoading, hasError, successful, endLoading }
}