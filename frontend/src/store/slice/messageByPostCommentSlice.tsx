import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { MESSAGE } from "@/libs/utils";
import { useSelector } from "react-redux";

export enum ModalBgColorType {
  ERROR = "red",
  SUCCESS = "green",
  DELETE = "gray",
  NULL = "null",
}

type State = {
  message: MESSAGE;
  bgColor: ModalBgColorType;
  visibleModal: boolean;
  waitId: NodeJS.Timeout | undefined;
};

type ActionProps = {
  message: MESSAGE;
  bgColor: ModalBgColorType;
};

const initialState: State = {
  message: MESSAGE.NULL,
  bgColor: ModalBgColorType.SUCCESS,
  visibleModal: false,
  waitId: undefined,
};

export const messageByPostCommentSlice = createSlice({
  name: "messageByPostComment",
  initialState,
  reducers: {
    setMessage: (state: State, action: PayloadAction<ActionProps>) => {
      state.message = action.payload.message;
      state.bgColor = action.payload.bgColor;
    },
    // setSuccessMessage: (state: State, action: PayloadAction<MESSAGE>) => {
    //   state.message = action.payload;
    //   state.bgColor = ModalBgColorType.SUCCESS;
    // },
    // setDeleteMessage: (state: State, action: PayloadAction<MESSAGE>) => {
    //   state.message = action.payload;
    //   state.bgColor = ModalBgColorType.DELETE;
    // },
    // setErrorMessage: (state: State, action: PayloadAction<MESSAGE>) => {
    //   state.message = action.payload;
    //   state.bgColor = ModalBgColorType.ERROR;
    // },
    messageClear: (state: State) => {
      state.message = MESSAGE.NULL;
      state.bgColor = ModalBgColorType.NULL;
    },
  },
});

export const {
  // setSuccessMessage,
  // setErrorMessage,
  // setDeleteMessage,
  setMessage,
  messageClear,
} = messageByPostCommentSlice.actions;
export const useMessage = () => {
  return useSelector((state: RootState) => state.messageByPostMessage.message);
};
export const useBgColor = () => {
  return useSelector((state: RootState) => state.messageByPostMessage.bgColor);
};
export default messageByPostCommentSlice.reducer;
