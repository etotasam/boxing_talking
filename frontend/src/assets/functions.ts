import _ from "lodash"
import dayjs from 'dayjs';
// ! types
import { BoxerType, MatchDataType } from "@/assets/types"


// ? boxerDataOnFormのtitle_holeプロパティをstring[]型に変形してデータベースに保存する為の関数
// export const convertToBoxerData = (boxerDataOnForm: BoxerType): BoxerType => {

//   const cloneData = _.cloneDeep(boxerDataOnForm)

//   const { title_hold } = boxerDataOnForm;
//   if (title_hold.length) {

//     const titlesArray = title_hold
//       .filter((obj) => {
//         return (
//           obj?.organization !== undefined && obj?.weightClass !== undefined
//         );
//       })
//       .map((titleData) => {
//         return `${titleData.organization}世界${titleData.weightClass}級王者`;
//       });

//     (cloneData.title_hold as unknown as string[]) = titlesArray
//     return cloneData as unknown as BoxerType
//   }
//   return cloneData as unknown as BoxerType
// }



export const extractBoxer = ({ targetBoxerId, boxers }: { targetBoxerId: number, boxers: BoxerType[] }): BoxerType | undefined => {
  return boxers.find(boxer => boxer.id === targetBoxerId)
}


//? 試合日が過ぎているか
export const isMatchDatePast = (matchDate: MatchDataType): boolean => {
  const today = dayjs().startOf('day');
  const dayAfterFight = dayjs(matchDate.match_date)
    .startOf('day')
    .add(1, 'day')
    .subtract(1, 'second');

  return today.isAfter(dayAfterFight)
}