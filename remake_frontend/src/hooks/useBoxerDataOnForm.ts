// ! recoil
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil"
import { boxerDataOnFormSelector } from "@/store/boxerDataOnFormState";
import { useEffect } from "react";
// ! data
import { initialBoxerDataOnForm } from "@/assets/boxerData";

export const useBoxerDataOnForm = () => {

  const setter = useSetRecoilState(boxerDataOnFormSelector)
  const state = useRecoilValue(boxerDataOnFormSelector)

  // ? コンポーネント表示の際に必ずform内のデータを初期化する
  useEffect(() => {
    return () => {
      setter(initialBoxerDataOnForm)
    }
  }, [])


  return { state, setter }
}




