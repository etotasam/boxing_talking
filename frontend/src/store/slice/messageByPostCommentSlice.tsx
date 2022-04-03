import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { MESSAGE } from "@/libs/utils";

type State = {
  message: MESSAGE;
  visibleModal: boolean;
};

const initialState: State = {
  message: MESSAGE.NULL,
  visibleModal: false,
};

export const messageByPostCommentSlice = createSlice({
  name: "messageByPostComment",
  initialState,
  reducers: {
    setSuccessMessage: (state: State, action: PayloadAction<MESSAGE>) => {
      state.message = action.payload;
      // state.visibleModal = true;
      // setTimeout(() => {
      //   state.visibleModal = false;
      // }, 5000);
    },
  },
});

export const { setSuccessMessage } = messageByPostCommentSlice.actions;
export const selectMessage = (state: RootState) =>
  state.messageByPostMessage.message;
// export const selectvisibleModal = (state: RootState) =>
//   state.messageByPostMessage.visibleModal;
export default messageByPostCommentSlice.reducer;
