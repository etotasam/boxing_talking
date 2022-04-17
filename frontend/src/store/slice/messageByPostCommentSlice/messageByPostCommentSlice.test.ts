import reducer, { setMessage, messageClear, InitialStateType, ActionProps, ModalBgColorType } from "."
import { MESSAGE } from "@/libs/utils";

describe("messageByPostCommentSliceのテスト", () => {
  const initialState: InitialStateType = {
    message: MESSAGE.NULL,
    bgColor: ModalBgColorType.NULL,
    visibleModal: false,
    waitId: undefined,
  }
  it("setMessage", () => {
    const payload: ActionProps = {
      message: MESSAGE.COMMENT_POST_SUCCESSFULLY,
      bgColor: ModalBgColorType.SUCCESS
    }
    const action = { type: setMessage.type, payload }
    const state = reducer(initialState, action)
    expect(state.message).toEqual(payload.message)
    expect(state.bgColor).toEqual(payload.bgColor)
    expect(state.visibleModal).toEqual(initialState.visibleModal)
    expect(state.waitId).toEqual(initialState.waitId)
  })
  it("messageClear", () => {
    const action = { type: messageClear.type }
    const state = reducer(initialState, action)
    expect(state.message).toEqual(MESSAGE.NULL)
    expect(state.bgColor).toEqual(ModalBgColorType.NULL)
    expect(state.visibleModal).toEqual(initialState.visibleModal)
    expect(state.waitId).toEqual(initialState.waitId)
  })
})