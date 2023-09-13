import { motion } from 'framer-motion';
import clsx from 'clsx';
//! types
import { BoxerType, MatchesDataType } from '@/assets/types';
//! components
import { BackgroundFlag } from './BackgroundFlag';
import { EngNameWithFlag } from '@/components/atomc/EngNameWithFlag';
import { useEffect, useRef } from 'react';
import { useMatchBoxerSectionHeight } from '@/hooks/useMatchBoxerSectionHeight';

type SetUpBoxersType = {
  predictionVote: ({
    name,
    color,
  }: {
    name: string;
    color: 'red' | 'blue';
  }) => void;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  sendPrecition: () => void;
  selectPredictionBoxer: { name: string; color: 'red' | 'blue' } | undefined;
  thisMatch: MatchesDataType | undefined;
  showConfirmModal: boolean;
  setShowConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
  thisMatchPredictionCount: Record<
    'redCount' | 'blueCount' | 'totalCount',
    number
  >;
  isFetchingComments: boolean;
};

export const SetUpBoxers = ({
  thisMatch,
  showConfirmModal,
  setShowConfirmModal,
  selectPredictionBoxer,
  sendPrecition,
  thisMatchPredictionOfUsers,
  predictionVote,
  thisMatchPredictionCount,
  isFetchingComments,
}: SetUpBoxersType) => {
  const { setter: setMatchBoxerSectionHeight } = useMatchBoxerSectionHeight();
  const boxerSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (boxerSectionRef.current)
      setMatchBoxerSectionHeight(boxerSectionRef.current.clientHeight);
  }, [boxerSectionRef.current]);

  const getPredictionCountPercent = (predictionCoount: number) => {
    const percent = Math.ceil(
      (predictionCoount / thisMatchPredictionCount.totalCount) * 100
    );
    if (percent) {
      return percent;
    } else {
      return 0;
    }
  };
  return (
    <>
      {thisMatch && (
        <section
          ref={boxerSectionRef}
          className="flex border-b-[1px] h-[100px] relative"
        >
          {/* //? 投票確認モーダル */}
          {showConfirmModal && (
            <PredictionConfirmModal
              boxerName={selectPredictionBoxer!.name!}
              execution={sendPrecition}
              cancel={() => setShowConfirmModal(false)}
            />
          )}
          <BoxerBox
            boxerColor={thisMatch.red_boxer}
            color="red"
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            predictionVote={predictionVote}
          />
          <BoxerBox
            boxerColor={thisMatch.blue_boxer}
            color="blue"
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            predictionVote={predictionVote}
          />
          {!isFetchingComments &&
            (thisMatchPredictionOfUsers === 'red' ||
              thisMatchPredictionOfUsers === 'blue') && (
              <>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{
                    width: `${getPredictionCountPercent(
                      thisMatchPredictionCount.redCount
                    )}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  // style={{ width: `${red}%` }}
                  className="bolck absolute bottom-0 left-0 bg-red-600 h-2"
                />
                <motion.span
                  initial={{ width: 0 }}
                  animate={{
                    width: `${getPredictionCountPercent(
                      thisMatchPredictionCount.blueCount
                    )}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="bolck absolute bottom-0 right-0 bg-blue-600 h-2"
                />
              </>
            )}
        </section>
      )}
    </>
  );
};

type PredictionConfirmModalType = {
  boxerName: string;
  execution: () => void;
  cancel: () => void;
};

const PredictionConfirmModal = ({
  boxerName,
  execution,
  cancel,
}: PredictionConfirmModalType) => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center">
        <div className="px-10 py-5 rounded-lg bg-white shadow-lg shadow-stone-500/50">
          <p>
            <span className="text-[18px] mx-2">{boxerName}</span>
            が勝つと思いますか？
          </p>
          <div className="flex justify-between mt-5">
            <button
              onClick={execution}
              className="bg-red-500 text-white py-1 px-5 rounded-md"
            >
              はい
            </button>
            <button
              onClick={cancel}
              className="bg-stone-500 text-white py-1 px-5 rounded-md"
            >
              わからない
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

type BoxerBoxType = {
  boxerColor: BoxerType;
  color: 'red' | 'blue';
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  predictionVote: ({
    name,
    color,
  }: {
    name: string;
    color: 'red' | 'blue';
  }) => void;
};

const BoxerBox = ({
  boxerColor,
  color,
  thisMatchPredictionOfUsers,
  predictionVote,
}: BoxerBoxType) => {
  return (
    <div
      onClick={() => predictionVote({ name: boxerColor.name, color })}
      className={clsx(
        'flex-1 py-5 relative',
        thisMatchPredictionOfUsers === 'No prediction vote' && 'cursor-pointer'
      )}
    >
      <BackgroundFlag
        nationaly={boxerColor.country}
        thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
      >
        <div
          className={
            'select-none absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col justify-center items-center'
          }
        >
          <EngNameWithFlag
            boxerCountry={boxerColor.country}
            boxerEngName={boxerColor.eng_name}
          />
          <h2 className={'text-[20px]'}>{boxerColor.name}</h2>
        </div>
      </BackgroundFlag>
    </div>
  );
};
