import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
//! types
import { MatchDataType } from '@/assets/types';
// ! components
import { MatchInfo } from '@/components/module/MatchInfo';
//! hooks
import { useFetchComments } from '@/hooks/apiHooks/useComment';

type LeftSectionType = {
  thisMatch: MatchDataType | undefined;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  commentPostTextareaHeight: number | undefined;
};

export const LeftSection = ({
  thisMatch,
  thisMatchPredictionOfUsers,
  commentPostTextareaHeight,
}: LeftSectionType) => {
  //試合データが取得されるまではrenderさせない
  if (!thisMatch) return;

  return (
    <div
      className="xl:w-[30%] w-[40%]"
      // style={{ marginBottom: `${commentPostTextareaHeight! + 30}px` }}
    >
      <div className="sticky top-5 flex justify-center">
        <div className="w-full max-w-[450px]">
          <div className="flex justify-center mt-5">
            <MatchInfo matchData={thisMatch} />
          </div>
          {/* //? 自身の投票と投票数 */}
          <PredictionsBar
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            thisMatch={thisMatch}
          />
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
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
}) => {
  const { isSuccess: isFetchCommentsSuccess } = useFetchComments(thisMatch!.id);
  //? 勝利予想の割合計算
  const [redCountRatio, setRedCountRatio] = useState<number>(0);
  const [blueCountRatio, setBlueCountRatio] = useState<number>(0);
  const setWinPredictionRate = (): void => {
    if (!thisMatch) return;
    const totalCount = thisMatch.count_red + thisMatch.count_blue;
    const redRatio = Math.round((thisMatch.count_red / totalCount) * 100);
    setRedCountRatio(!isNaN(redRatio) ? redRatio : 0);
    const blueRatio = Math.round((thisMatch.count_blue / totalCount) * 100);
    setBlueCountRatio(!isNaN(blueRatio) ? blueRatio : 0);
  };
  useEffect(() => {
    setWinPredictionRate();
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

            {isFetchCommentsSuccess && (
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
                {
                  <span
                    className={clsx(
                      'block text-right pr-3 text-lg font-semibold right-0 top-0',
                      "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1",
                      thisMatchPredictionOfUsers === 'blue' && 'text-blue-500'
                    )}
                  >
                    {thisMatch.count_blue}
                  </span>
                }
              </div>
            )}

            <div className="flex mt-0">
              <div className="flex-1 flex justify-between relative">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={
                    isFetchCommentsSuccess && { width: `${redCountRatio}%` }
                  }
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="h-[10px] absolute top-0 left-[-1px] rounded-[50px] bg-red-600"
                />

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={
                    isFetchCommentsSuccess && { width: `${blueCountRatio}%` }
                  }
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
