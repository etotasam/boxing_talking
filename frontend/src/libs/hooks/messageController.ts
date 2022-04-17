import React from "react"
import { useDispatch } from "react-redux"
import {
  useMessage,
  // setSuccessMessage,
  // setErrorMessage,
  // setDeleteMessage,
  setMessage,
  messageClear,
  useBgColor,
  ModalBgColorType,
} from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

export const useMessageController = () => {
  const dispatch = useDispatch()
  const [id, setId] = React.useState<NodeJS.Timeout>()

  const wait = (ms: number) => {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      setId(id);
    });
  };

  const setMessageToModal = async (message: MESSAGE, bgColor: ModalBgColorType) => {
    // console.log("id", id);
    // if (id) {
    //   clearTimeout(id)
    // }
    dispatch(setMessage({ message, bgColor }));
    // await wait(3000);
    // dispatch(messageClear())
  }

  // const successMessageToModal = async (message: MESSAGE) => {
  //   if (successId) {
  //     clearTimeout(successId)
  //   }
  //   dispatch(setSuccessMessage(message));
  //   await wait(3000, setSuccessId);
  //   dispatch(messageClear())
  // }

  // const errorMessageToModal = async (message: MESSAGE) => {
  //   if (errorId) {
  //     console.log(errorId);
  //     clearTimeout(errorId)
  //   }
  //   dispatch(setErrorMessage(message));
  //   await wait(3000, setErrorId);
  //   dispatch(messageClear())
  // }

  // const deleteMessageToModal = async (message: MESSAGE) => {
  //   if (eleteId) {
  //     clearTimeout(eleteId)
  //   }
  //   dispatch(setDeleteMessage(message));
  //   await wait(3000, setDeleteId);
  //   dispatch(messageClear())
  // }

  const clearMessageOnModal = React.useCallback(() => {
    dispatch(messageClear())
  }, [])

  const message = useMessage()
  const bgColor = useBgColor()

  return { setMessageToModal, clearMessageOnModal, bgColor, message }
}