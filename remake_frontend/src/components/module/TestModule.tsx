import { SimpleFightBox } from './SimpleFightBox';
// ! hooks
import { useFetchMatches } from '@/hooks/useMatch';

export const TestModule = () => {
  const { data: matchesData } = useFetchMatches();

  return (
    <>
      <h1>test</h1>
      {matchesData && (
        <SimpleFightBox onClick={() => {}} matchData={matchesData[2]} />
      )}
    </>
  );
};

//!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

{
  /* //? match info */
}

// <div className="w-[30%]">
// <div className="sticky top-5">
//   <div className="w-full">
//     <div className="flex justify-center mt-5">
//       <SelectedMatchInfo matchData={thisMatch} />
//     </div>
//     {/* //? 自身の投票と投票数 */}
//     {thisMatchPredictionOfUsers && (
//       <div className="flex justify-center mt-5">
//         <div className="w-[80%]">
//           {thisMatchPredictionOfUsers === 'red' && (
//             <p className="text-center">
//               {thisMatch?.red_boxer.name}の勝利を予想しました
//             </p>
//           )}
//           {thisMatchPredictionOfUsers === 'blue' && (
//             <p className="text-center">
//               {thisMatch?.blue_boxer.name}の勝利を予想しました
//             </p>
//           )}
//           <div className="flex">
//             <div className="flex-1 flex justify-center">
//               <div className="rounded-[50%] w-[60px] h-[60px] flex justify-center items-center bg-red-500">
//                 <p className="text-white text-[24px]">
//                   {thisMatch?.count_red}
//                 </p>
//               </div>
//             </div>
//             <div className="flex-1 flex justify-center">
//               <div className="rounded-[50%] w-[60px] h-[60px] flex justify-center items-center bg-blue-500">
//                 <p className="text-white text-[24px]">
//                   {thisMatch?.count_blue}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// </div>
// </div>
