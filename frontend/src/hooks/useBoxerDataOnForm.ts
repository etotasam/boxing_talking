// ! types
import _ from "lodash"
// ! recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { boxerDataOnFormSelector } from "@/store/boxerDataOnFormState";

/**
 * state BoxerDataOnFormTypeの値を返す。BoxerEditコンポーネントで扱うデータタイプ
 *
 * setter 基本的にはRecoilのboxerDataOnFormStateに保存
 *        BoxerTypeの値を渡す事も出来て、その場合BoxerDataOnFormTypeのフォーマットして保存してくれる
 * @returns {state, setter}
 */
export const useBoxerDataOnForm = () => {

  const setter = useSetRecoilState(boxerDataOnFormSelector)
  const state = useRecoilValue(boxerDataOnFormSelector)


  return { state, setter }
}

