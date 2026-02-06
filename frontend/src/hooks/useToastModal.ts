// !Recoil
import { useRecoilState } from "recoil"
import { toastModalState } from "@/store/toastModalState"
// !types
import { MessageType, BgColorType } from "@/assets/types";
import { BG_COLOR_ON_TOAST_MODAL } from "@/assets/statusesOnToastModal";


export const useToastModal = () => {

  //? ToastModalの状態(show/hide)
  const [{ isShow: isShowToastModal, message: messageOnToast, bgColor }, setter] = useRecoilState(toastModalState)

  /**
   * ! ToastModalを表示させる
   */
  const showToastModal = () => {
    setter(current => {
      return { ...current, isShow: true }
    })
  }
  /**
   * ! ToastModalを隠す
   */
  const hideToastModal = () => {
    setter(current => {
      return { ...current, isShow: false }
    })
  }

  /**
   * ! ToastModalのメッセージと背景色をデフォルトに戻す
   */
  const resetToastModalToDefault = () => {
    setter(curr => {
      return { ...curr, message: "", bgColor: "null" }
    })
  }

  /**
   * ! messageと背景カラーをセットする
   * @param {{ Message, bgColor }} セットしたいデータ
   * @returns {void}
   */
  const setToastModal = ({ message, bgColor }: { message: MessageType, bgColor: BgColorType }) => {
    setter(current => {
      return { ...current, message, bgColor }
    })
  }

  const showToastModalMessage = ({ message, bgColor }: { message: MessageType, bgColor: BgColorType }) => {
    setter(current => {
      return { ...current, message, bgColor, isShow: true }
    })
  }

  const showErrorToast = (message: MessageType): void => {
    showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR })
  }

  const showSuccessToast = (message: MessageType): void => {
    showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.SUCCESS })
  }

  const showNoticeToast = (message: MessageType): void => {
    showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE })
  }

  const showGrayBackToast = (message: MessageType): void => {
    showToastModalMessage({ message, bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY })
  }

  return { showErrorToast, showSuccessToast, showNoticeToast, showGrayBackToast, showToastModal, hideToastModal, messageOnToast, bgColor, resetToastModalToDefault, isShowToastModal, setToastModal, showToastModalMessage }
}