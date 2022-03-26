import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type State = {
  message: string;
};

const initialState: State = {
  message: "",
};

export const messageByPostCommentSlice = createSlice({
  name: "messageByPostComment",
  initialState,
  reducers: {
    setSuccessMessage: (state: State, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
  },
});

export const { setSuccessMessage } = messageByPostCommentSlice.actions;
export const selectMessage = (state: RootState) =>
  state.messageByPostMessage.message;
export default messageByPostCommentSlice.reducer;
