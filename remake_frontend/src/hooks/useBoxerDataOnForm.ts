// ! types
import _ from "lodash"
// ! recoil
import { useSetRecoilState, useRecoilValue } from "recoil"
import { boxerDataOnFormSelector } from "@/store/boxerDataOnFormState";
import { useEffect } from "react";
// ! data
import { initialBoxerDataOnForm } from "@/assets/boxerData";
import { ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
// ! types
import { BoxerType, BoxerDataOnFormType } from "@/assets/types";



/**
 * state BoxerDataOnFormTypeの値を返す。BoxerEditコンポーネントで扱うデータタイプ
 *
 * setter 基本的にはRecoilのboxerDataOnFormStateに保存
 *        BoxerTypeの値を渡す事も出来て、その場合BoxerDataOnFormTypeのフォーマットして保存してくれる
 * @returns {state, setter}
 */
export const useBoxerDataOnForm = () => {

  const innerSetter = useSetRecoilState(boxerDataOnFormSelector)
  const state = useRecoilValue(boxerDataOnFormSelector)

  const isBoxerDataOnFormType = (data: BoxerDataOnFormType | BoxerType | typeof innerSetter): data is BoxerDataOnFormType => {
    if (typeof data !== "function") {
      return _.every(data.title_hold, _.isObject)
    }
    return false
  }


  const convertBoxerDataToFormData = (boxerData: BoxerDataOnFormType | BoxerType): BoxerDataOnFormType => {
    const cloneData = _.cloneDeep(boxerData)

    if (!boxerData.title_hold.length) {
      return cloneData as BoxerDataOnFormType
    }

    if (isBoxerDataOnFormType(boxerData)) {
      return cloneData as BoxerDataOnFormType
    } else {
      const convertedTitleHoldData = boxerData.title_hold.reduce((accumurator, current): any => {
        for (const word of Object.values(ORGANIZATIONS)) {
          if (current.includes(word)) {
            for (const weight of Object.values(WEIGHT_CLASS)) {
              if (current.includes(weight)) {
                return [
                  ...accumurator,
                  { organization: word, weightClass: weight },
                ];
              }
            }
          }
        }
        return [...accumurator];
      }, []);

      cloneData.title_hold = convertedTitleHoldData
      return cloneData as BoxerDataOnFormType
    }
  }

  const setter = (argData: ((arg: BoxerDataOnFormType) => void) | BoxerDataOnFormType | BoxerType) => {
    if (typeof argData === "function") {
      innerSetter(argData as any)
    } else {
      const data = convertBoxerDataToFormData(argData)
      innerSetter(data)
    }
  }

  // ? コンポーネント表示の際に必ずform内のデータを初期化する
  useEffect(() => {
    return () => {
      setter(initialBoxerDataOnForm)
    }
  }, [])


  return { state, setter }
}

