import _ from "lodash"
// ! types
import { BoxerType, BoxerDataOnFormType } from "@/assets/types"


// ? boxerDataOnFormのtitle_holeプロパティをstring[]型に変形してデータベースに保存する為の関数
export const convertToBoxerData = (boxerDataOnForm: BoxerDataOnFormType): BoxerType => {

  const cloneData = _.cloneDeep(boxerDataOnForm)

  const { title_hold } = boxerDataOnForm;
  if (title_hold.length) {

    const titlesArray = title_hold
      .filter((obj) => {
        return (
          obj?.organization !== undefined && obj?.weightClass !== undefined
        );
      })
      .map((titleData) => {
        return `${titleData.organization}世界${titleData.weightClass}級王者`;
      });

    (cloneData.title_hold as unknown as string[]) = titlesArray
    return cloneData as unknown as BoxerType
  }
  return cloneData as unknown as BoxerType
}



export const getBoxerDataWithID = ({ boxerID, boxersData }: { boxerID: number, boxersData: BoxerType[] }): BoxerType | undefined => {
  return boxersData.find(boxer => boxer.id === boxerID)
}