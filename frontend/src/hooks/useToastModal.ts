// !Recoil
import { useRecoilValue, useSetRecoilState } from "recoil"
import { toastModalSelector } from "@/store/toastModalState"
// !types
import { MessageType, BgColorType } from "@/assets/types";



export const useToastModal = () => {

  //? ToastModalの状態(show/hide)
  const { isShow: isShowToastModal, message: messageOnToast, bgColor } = useRecoilValue(toastModalSelector)

  const setter = useSetRecoilState(toastModalSelector)

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
   * ! messageと背景をセットする
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


  return { showToastModal, hideToastModal, messageOnToast, bgColor, resetToastModalToDefault, isShowToastModal, setToastModal, showToastModalMessage }
}