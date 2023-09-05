// ! types
import _ from "lodash"
// ! recoil
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil"
import { boxerDataOnFormSelector } from "@/store/boxerDataOnFormState";
import { useEffect } from "react";
// ! data
import { initialBoxerDataOnForm } from "@/assets/boxerData";
import { ORGANIZATIONS, WEIGHT_CLASS } from "@/assets/boxerData";
// ! types
import { BoxerType, BoxerDataOnFormType } from "@/assets/types";

export const useBoxerDataOnForm = () => {

  const innerSetter = useSetRecoilState(boxerDataOnFormSelector)
  const state = useRecoilValue(boxerDataOnFormSelector)

  const isBoxerDataOnFormType = (data: BoxerDataOnFormType | BoxerType | typeof innerSetter): data is BoxerDataOnFormType => {
    if (typeof data !== "function") {
      return _.isObject(data.title_hold)
    }
    return false
  }


  const convertBoxerDataToFormData = (boxerData: BoxerDataOnFormType | BoxerType): BoxerDataOnFormType => {
    const cloneData = _.cloneDeep(boxerData)

    if (boxerData.title_hold.length) {
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

  const setter = (argData: ((arg: BoxerDataOnFormType | BoxerType) => void) | BoxerDataOnFormType | BoxerType) => {
    // let newValue
    if (typeof argData === "function") {
      // const nowValue = state
      innerSetter(arg => arg)
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

