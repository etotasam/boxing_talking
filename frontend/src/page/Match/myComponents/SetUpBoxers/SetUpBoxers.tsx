import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { MdHowToVote } from 'react-icons/md';
//! types
import { BoxerType, MatchDataType } from '@/assets/types';
//! components
import { FlagImage } from '@/components/atomic/FlagImage';
import { BackgroundFlag } from './BackgroundFlag';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { useEffect, useRef } from 'react';
import { useMatchBoxerSectionHeight } from '@/hooks/useMatchBoxerSectionHeight';
import { BoxerInfoModal } from '@/components/modal/BoxerInfoModal';
import { MatchInfoModal } from '@/components/modal/MatchInfoModal';
//! hook
import {
  useVoteMatchPrediction,
  useAllFetchMatchPredictionOfAuthUser,
} from '@/hooks/apiHooks/uesWinLossPrediction';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useMatchInfoModal } from '@/hooks/useMatchInfoModal';

type SetUpBoxersType = {
  paramsMatchID: number;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
  thisMatch: MatchDataType | undefined;
  thisMatchPredictionCount: Record<
    'redCount' | 'blueCount' | 'totalCount',
    number
  >;
  isFetchingComments: boolean;
  isThisMatchAfterToday: boolean | undefined;
};

export const SetUpBoxers = ({
  paramsMatchID,
  thisMatch,
  thisMatchPredictionOfUsers,
  thisMatchPredictionCount,
  isFetchingComments,
  isThisMatchAfterToday,
}: SetUpBoxersType) => {
  //? use hook
  const { matchVotePrediction } = useVoteMatchPrediction();
  const { setter: setMatchBoxerSectionHeight } = useMatchBoxerSectionHeight();
  const { data: AllMatchPredictionOfAuthUserState } =
    useAllFetchMatchPredictionOfAuthUser();
  const { device } = useWindowSize();
  const { state: isShowMatchInfoModal, hideMatchInfoModal } =
    useMatchInfoModal();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const boxerSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (boxerSectionRef.current)
      setMatchBoxerSectionHeight(boxerSectionRef.current.clientHeight);
  }, [boxerSectionRef.current]);

  const getPredictionCountPercent = (predictionCount: number) => {
    const percent = Math.round(
      (predictionCount / thisMatchPredictionCount.totalCount) * 100
    );
    if (!isNaN(percent)) {
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

  //?ボクサー情報のセットと表示(modal)
  const [boxerDataForOnModal, setBoxerDataForOnModal] = useState<BoxerType>();
  const [showBoxerInfoModal, setShowBoxerInfoModal] = useState(false);
  const viewBoxerInfo = (boxerData: BoxerType) => {
    if (device === 'PC') return;
    setBoxerDataForOnModal(boxerData);
    setShowBoxerInfoModal(true);
  };
  useEffect(() => {
    if (device === 'PC') {
      setShowBoxerInfoModal(false);
    }
  }, [device]);

  return (
    <>
      {showBoxerInfoModal && (
        <BoxerInfoModal
          boxerData={boxerDataForOnModal}
          onClick={() => setShowBoxerInfoModal(false)}
        />
      )}

      {thisMatch && isShowMatchInfoModal && (
        <MatchInfoModal
          onClick={() => hideMatchInfoModal()}
          matchData={thisMatch}
        />
      )}

      {thisMatch && (
        <section
          ref={boxerSectionRef}
          className={clsx(
            'flex border-b-[1px] border-stone-300 min-h-[60px]',
            device === 'PC' && 'relative',
            device === 'SP' && 'sticky top-0'
          )}
        >
          {/* //? 投票ボタン */}
          {isThisMatchAfterToday && (
            <AnimatePresence>
              {isPredictionVote === false && (
                <VotesButton setShowConfirmModal={setShowConfirmModal} />
              )}
            </AnimatePresence>
          )}
          <BoxerBox
            color="red"
            boxer={thisMatch.red_boxer}
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            isThisMatchAfterToday={isThisMatchAfterToday}
            onClick={() => viewBoxerInfo(thisMatch.red_boxer)}
          />
          <BoxerBox
            color="blue"
            boxer={thisMatch.blue_boxer}
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
            isThisMatchAfterToday={isThisMatchAfterToday}
            onClick={() => viewBoxerInfo(thisMatch.blue_boxer)}
          />
          {/* //? 投票数bar */}
          {device &&
            device === 'SP' &&
            !isFetchingComments &&
            (thisMatchPredictionOfUsers === 'red' ||
              thisMatchPredictionOfUsers === 'blue') && (
              <>
                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${getPredictionCountPercent(
                      thisMatchPredictionCount.redCount
                    )}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="block absolute bottom-0 left-0 bg-red-600 h-1"
                />
                <motion.span
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${getPredictionCountPercent(
                      thisMatchPredictionCount.blueCount
                    )}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="block absolute bottom-0 right-0 bg-blue-600 h-1"
                />
              </>
            )}
        </section>
      )}
      {/* //? 投票モーダル */}
      {thisMatch && showConfirmModal && (
        <PredictionConfirmModal
          thisMatch={thisMatch}
          voteExecution={voteExecution}
          cancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
};

type PredictionConfirmModalType = {
  thisMatch: MatchDataType;
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
              className="bg-white border-[1px] border-stone-400 text-stone-600 duration-300 py-1 px-5 mr-5 rounded-[25px] text-sm"
            >
              {thisMatch.red_boxer.name}
            </button>
            <button
              onClick={() => voteExecution('blue')}
              className="bg-white border-[1px] border-stone-400 text-stone-600 duration-300 py-1 px-5 ml-5 rounded-[25px] text-sm"
            >
              {thisMatch.blue_boxer.name}
            </button>
          </div>

          <div className="mt-5 flex justify-center items-center">
            <button
              onClick={cancel}
              className="max-w-[500px] w-full  bg-stone-600 text-white  py-1 rounded-sm"
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
  boxer: BoxerType;
  isThisMatchAfterToday: boolean | undefined;
  color: 'red' | 'blue';
  onClick: () => void;
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
};
const BoxerBox = ({
  boxer,
  thisMatchPredictionOfUsers,
  isThisMatchAfterToday,
  onClick,
}: BoxerBoxType) => {
  return (
    <div onClick={onClick} className={clsx('flex-1 py-5 relative')}>
      <BackgroundFlag
        nationality={boxer.country}
        thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
        isThisMatchAfterToday={isThisMatchAfterToday}
      >
        <div
          className={
            'select-none absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full flex flex-col justify-center items-center'
          }
        >
          <EngNameWithFlag
            boxerCountry={boxer.country}
            boxerEngName={boxer.eng_name}
          />
          <h2
            className={clsx(
              boxer.name.length > 7
                ? `sm:text-[18px] text-[12px]`
                : `sm:text-[20px] text-[16px]`
            )}
          >
            {boxer.name}
          </h2>
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

  const handleClick = () => {
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
        onClick={handleClick}
        className="z-20 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:w-[50px] sm:h-[50px] w-[40px] h-[40px] bg-green-600 hover:bg-green-600/80 rounded-[50%] flex justify-center items-center text-white text-[20px] hover:text-[25px] duration-200"
      >
        <MdHowToVote />
      </motion.button>
    </>
  );
};
