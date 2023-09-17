import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { MdHowToVote } from 'react-icons/md';
//! types
import { BoxerType, MatchesDataType } from '@/assets/types';
//! components
import { BackgroundFlag } from './BackgroundFlag';
import { EngNameWithFlag } from '@/components/atomc/EngNameWithFlag';
import { useEffect, useRef } from 'react';
import { useMatchBoxerSectionHeight } from '@/hooks/useMatchBoxerSectionHeight';
//! hook
import {
  useVoteMatchPrediction,
  useAllFetchMatchPredictionOfAuthUser,
} from '@/hooks/uesWinLossPredition';

type SetUpBoxersType = {
  paramsMatchID: number;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  thisMatch: MatchesDataType | undefined;
  thisMatchPredictionCount: Record<
    'redCount' | 'blueCount' | 'totalCount',
    number
  >;
  isFetchingComments: boolean;
};

export const SetUpBoxers = ({
  paramsMatchID,
  thisMatch,
  thisMatchPredictionOfUsers,
  thisMatchPredictionCount,
  isFetchingComments,
}: SetUpBoxersType) => {
  //? use hook
  const { matchVotePrediction } = useVoteMatchPrediction();
  const { setter: setMatchBoxerSectionHeight } = useMatchBoxerSectionHeight();
  const { data: AllMatchPredictionOfAuthUserState } =
    useAllFetchMatchPredictionOfAuthUser();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  const voteExecution = (color: 'red' | 'blue') => {
    //? 勝敗予想の投票
    matchVotePrediction({
      matchID: paramsMatchID,
      prediction: color,
    });
    setShowConfirmModal(false);
  };

  const isPredictionVote = useMemo((): boolean | undefined => {
    if (AllMatchPredictionOfAuthUserState) {
      const bool = AllMatchPredictionOfAuthUserState.some(
        (ob) => ob.match_id === paramsMatchID
      );
      return bool;
    }
    return undefined;
  }, [paramsMatchID, AllMatchPredictionOfAuthUserState]);

  //? 試合の日が当日以降かどうか
  const [matchIsAfterToday, setMatchIsAfterToday] = useState<boolean>();
  useEffect(() => {
    if (!thisMatch) return;
    const todaySubtractOneSecond = dayjs().startOf('day').add(1, 'second');
    const isAfterToday = dayjs(thisMatch.match_date).isAfter(
      todaySubtractOneSecond
    );
    setMatchIsAfterToday(isAfterToday);
  }, [thisMatch]);

  return (
    <>
      {thisMatch && (
        <section
          ref={boxerSectionRef}
          className="flex border-b-[1px] h-[100px] relative"
        >
          {/* //? 投票ボタン */}
          {matchIsAfterToday && (
            <AnimatePresence>
              {isPredictionVote === false && (
                <VotesButton setShowConfirmModal={setShowConfirmModal} />
              )}
            </AnimatePresence>
          )}
          {/* //? 投票モーダル */}
          {showConfirmModal && (
            <PredictionConfirmModal
              thisMatch={thisMatch}
              voteExecution={voteExecution}
              cancel={() => setShowConfirmModal(false)}
            />
          )}
          <BoxerBox
            boxerColor={thisMatch.red_boxer}
            color="red"
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            // predictionVote={predictionVote}
          />
          <BoxerBox
            boxerColor={thisMatch.blue_boxer}
            color="blue"
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            // predictionVote={predictionVote}
          />
          {/* //? 投票数bar */}
          {!isFetchingComments &&
            (thisMatchPredictionOfUsers === 'red' ||
              thisMatchPredictionOfUsers === 'blue') && (
              <>
                <motion.span
                  initial={{
                    width: 0,
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    width: `${getPredictionCountPercent(
                      thisMatchPredictionCount.redCount
                    )}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="bolck absolute bottom-0 left-0 bg-red-600 h-2"
                />
                <motion.span
                  initial={{
                    opacity: 0,
                    width: 0,
                  }}
                  animate={{
                    opacity: 1,
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
  thisMatch: MatchesDataType;
  voteExecution: (color: 'red' | 'blue') => void;
  cancel: () => void;
};

const PredictionConfirmModal = ({
  thisMatch,
  voteExecution,
  cancel,
}: PredictionConfirmModalType) => {
  return (
    <>
      <div className="z-20 fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center">
        <div className="px-10 py-5 bg-white border-[1px] border-stone-400 shadow-lg shadow-stone-500/50">
          <p className="text-center text-stone-600">
            どちらが勝つと思いますか？
          </p>
          <div className="flex justify-between mt-5">
            <button
              onClick={() => voteExecution('red')}
              className="bg-stone-700 hover:bg-red-700 duration-300 text-white py-1 px-5 mr-5 rounded-sm text-sm"
            >
              {thisMatch.red_boxer.name}
            </button>
            <button
              onClick={cancel}
              className="border-[1px] border-stone-500 text-stone-500  py-1 px-5 rounded-sm"
            >
              わからない
            </button>
            <button
              onClick={() => voteExecution('blue')}
              className="bg-stone-700 hover:bg-blue-700 duration-300 text-white py-1 px-5 ml-5 rounded-sm text-sm"
            >
              {thisMatch.blue_boxer.name}
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
};

const BoxerBox = ({ boxerColor, thisMatchPredictionOfUsers }: BoxerBoxType) => {
  return (
    <div className={clsx('flex-1 py-5 relative')}>
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

type VoteButtonType = React.ComponentProps<'button'> & {
  setShowConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const VotesButton = ({ setShowConfirmModal }: VoteButtonType) => {
  const {
    isRefetching: isRefetchingAllMatchPrediction,
    isLoading: isLoadingAllMatchPrediction,
  } = useAllFetchMatchPredictionOfAuthUser();

  const hancleClick = () => {
    if (isRefetchingAllMatchPrediction || isLoadingAllMatchPrediction) return;
    setShowConfirmModal(true);
  };
  return (
    <>
      <motion.button
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={hancleClick}
        className="z-20 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50px] h-[50px] bg-green-600 hover:bg-green-600/80 rounded-[50%] flex justify-center items-center text-white text-[20px] hover:text-[25px] duration-200"
      >
        <MdHowToVote />
      </motion.button>
    </>
  );
};
