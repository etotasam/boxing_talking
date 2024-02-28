import { pickBy, isEqual } from 'lodash';
import { MatchUpdateFormType } from '@/assets/types';


type FormDataKeys = keyof MatchUpdateFormType;
type PicModifiedDataType = {
  modifiedFormData: MatchUpdateFormType;
  originFormData: MatchUpdateFormType;
};
//? 現在のmatchデータと変更データを比較して、変更があるデータだけを抽出
export const pickModifiedData = (prop: PicModifiedDataType): Partial<MatchUpdateFormType> => {
  const { modifiedFormData, originFormData } = prop;
  //? 変更のあるデータだけを抽出
  const extractData: Partial<MatchUpdateFormType> = pickBy(modifiedFormData, (value, key) => {
    const formDataKey = key as FormDataKeys;
    if (formDataKey === 'titles') {
      return !isEqual(value, originFormData!.titles);
    } else {
      return originFormData![formDataKey] !== value;
    }
  });
  return extractData;
};