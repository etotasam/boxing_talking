import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { MESSAGE } from "@/libs/utils";
import { useSelector } from "react-redux";

export enum ModalBgColorType {
  ERROR = "red",
  SUCCESS = "green",
  DELETE = "gray",
  NOTICE = "blue",
  NULL = "null",
}

export type InitialStateType = {
  message: MESSAGE;
  bgColor: ModalBgColorType;
  visibleModal: boolean;
  waitId: NodeJS.Timeout | undefined;
};

export type ActionProps = {
  message: MESSAGE;
  bgColor: ModalBgColorType;
};

const initialState: InitialStateType = {
  message: MESSAGE.NULL,
  bgColor: ModalBgColorType.SUCCESS,
  visibleModal: false,
  waitId: undefined,
};

export const messageByPostCommentSlice = createSlice({
  name: "messageByPostComment",
  initialState,
  reducers: {
    setMessage: (state: InitialStateType, action: PayloadAction<ActionProps>) => {
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
    messageClear: (state: InitialStateType) => {
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
