import _ from "lodash"
// ! types
import { BoxerType } from "@/assets/types"




// ? boxerDataOnFormのtitle_holeプロパティをstring[]型に変形してデータベースに保存する為の関数
// export const boxerDataConverter = (boxerDataOnForm: BoxerType): BoxerType => {

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

//     copy_boxerDataOnForm.title_hold = titlesArray;
//     return copy_boxerDataOnForm as BoxerType
//   }
//   return copy_boxerDataOnForm as BoxerType
// }
