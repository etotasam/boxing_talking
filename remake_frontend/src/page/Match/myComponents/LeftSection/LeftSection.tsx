import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
//! types
import { MatchDataType } from '@/assets/types';
// ! components
import { SelectedMatchInfo } from '@/page/Admin/MatchEdit';
import { useEffect } from 'react';

type LeftSectionType = {
  thisMatch: MatchDataType | undefined;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
};

export const LeftSection = ({
  thisMatch,
  thisMatchPredictionOfUsers,
}: LeftSectionType) => {
  return (
    <div className="xl:w-[30%] w-[40%]">
      <div className="sticky top-5 flex justify-center">
        <div className="w-full max-w-[450px]">
          <div className="flex justify-center mt-5">
            <SelectedMatchInfo matchData={thisMatch} />
          </div>
          {/* //? 自身の投票と投票数 */}
          {(thisMatchPredictionOfUsers === 'red' ||
            thisMatchPredictionOfUsers === 'blue') && (
            <PredictionsBar
              thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
              thisMatch={thisMatch}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PredictionsBar = ({
  thisMatch,
  thisMatchPredictionOfUsers,
}: {
  thisMatch: MatchDataType | undefined;
  thisMatchPredictionOfUsers: 'red' | 'blue';
}) => {
  //? 勝利予想の割合計算
  const [redCountRaito, setRedCountRaito] = useState<number>(0);
  const [blueCountRaito, setBlueCountRaito] = useState<number>(0);
  useEffect(() => {
    if (!thisMatch) return;
    const totalCount = thisMatch.count_red + thisMatch.count_blue;
    const redRaito = Math.round((thisMatch.count_red / totalCount) * 100);
    setRedCountRaito(!isNaN(redRaito) ? redRaito : 0);
    const blueRaito = Math.round((thisMatch.count_blue / totalCount) * 100);
    setBlueCountRaito(!isNaN(blueRaito) ? blueRaito : 0);
  }, [thisMatch]);

  return (
    <>
      {thisMatch && (
        <div className="flex justify-center mt-5">
          <div className="w-[80%]">
            <p className="text-center lg:text-sm text-xs font-light">
              <span
                className={clsx(
                  'relative',
                  'after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:border-b-[1px] after:border-stone-600 after:w-[115%]'
                )}
              >
                {thisMatchPredictionOfUsers === 'red' &&
                  `${thisMatch.red_boxer.name}の勝利に投票しました`}
                {thisMatchPredictionOfUsers === 'blue' &&
                  `${thisMatch.blue_boxer.name}の勝利に投票しました`}
              </span>
            </p>

            <div className="flex justify-between mt-5">
              <span
                className={clsx(
                  'block pl-3 text-lg font-semibold right-0 top-0',
                  "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1",
                  thisMatchPredictionOfUsers === 'red' && 'text-red-500'
                )}
              >
                {thisMatch.count_red}
              </span>
              <span
                className={clsx(
                  'block text-right pr-3 text-lg font-semibold right-0 top-0',
                  "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1",
                  thisMatchPredictionOfUsers === 'blue' && 'text-blue-500'
                )}
              >
                {thisMatch.count_blue}
              </span>
            </div>

            <div className="flex mt-0">
              <div className="flex-1 flex justify-between relative">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${redCountRaito}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="h-[10px] absolute top-0 left-[-1px] rounded-[50px] bg-red-600"
                />

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${blueCountRaito}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="h-[10px] absolute top-0 right-[-1px] rounded-[50px] bg-blue-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
