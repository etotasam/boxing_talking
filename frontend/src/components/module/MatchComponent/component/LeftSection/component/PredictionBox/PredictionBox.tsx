import { useContext, useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
//! type
import { MatchDataType } from '@/assets/types';
//! context
import {
  ThisMatchPredictionByUserContext,
  IsThisMatchAfterTodayContext,
} from '@/components/module/MatchComponent/MatchContainer';
//! hooks
import { useModalState } from '@/hooks/useModalState';
//! icon
import { MdHowToVote } from 'react-icons/md';

export const PredictionsBox = ({
  matchData,
}: {
  matchData: MatchDataType | undefined;
}) => {
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionOfUser = useContext(
    ThisMatchPredictionByUserContext
  );

  //? userがこの試合への勝敗予想は投票済みかどうか
  const isVoted =
    thisMatchPredictionOfUser === 'red' || thisMatchPredictionOfUser === 'blue';

  //? 試合日が未来かどうか
  const isThisMatchAfterToday = useContext(IsThisMatchAfterTodayContext);

  //? 勝敗予想投票数の表示条件
  const isShowPredictionBar =
    (isVoted || isThisMatchAfterToday === false) && !!matchData;

  const isShowVoteBox =
    !isVoted && isThisMatchAfterToday === true && !!matchData;

  return (
    <>
      <div className="h-[50px]">
        {isShowPredictionBar && <PredictionBox matchData={matchData} />}
        {isShowVoteBox && <VoteBox />}
      </div>
    </>
  );
};

const PredictionBox = ({ matchData }: { matchData: MatchDataType }) => {
  return (
    <div className="flex justify-center">
      <div className="w-[95%]">
        <PredictionVoteCount matchData={matchData} />
        <PredictionBar matchData={matchData} />
      </div>
    </div>
  );
};

const PredictionVoteCount = ({ matchData }: { matchData: MatchDataType }) => {
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionOfUser = useContext(
    ThisMatchPredictionByUserContext
  );

  return (
    <div className="flex justify-between text-stone-300">
      <span
        className={clsx(
          'block pl-3 text-lg font-semibold right-0 top-0',
          "after:content-['票'] after:text-xs after:text-stone-300 after:ml-1",
          thisMatchPredictionOfUser === 'red' && 'text-red-400'
        )}
      >
        {matchData.count_red}
      </span>
      {
        <span
          className={clsx(
            'block text-right pr-3 text-lg font-semibold right-0 top-0',
            "after:content-['票'] after:text-xs after:text-stone-300 after:ml-1",
            thisMatchPredictionOfUser === 'blue' && 'text-blue-500'
          )}
        >
          {matchData.count_blue}
        </span>
      }
    </div>
  );
};

type PredictionBarType = {
  matchData: MatchDataType;
};
const PredictionBar = (props: PredictionBarType) => {
  const { matchData } = props;

  const [redCountRatio, setRedCountRatio] = useState<number>(0);
  const [blueCountRatio, setBlueCountRatio] = useState<number>(0);

  const setWinPredictionRate = (): void => {
    if (!matchData) return;
    const totalCount = matchData.count_red + matchData.count_blue;
    const redRatio = Math.round((matchData.count_red / totalCount) * 100);
    setRedCountRatio(!isNaN(redRatio) ? redRatio : 0);
    const blueRatio = Math.round((matchData.count_blue / totalCount) * 100);
    setBlueCountRatio(!isNaN(blueRatio) ? blueRatio : 0);
  };
  useEffect(() => {
    setWinPredictionRate();
  }, [matchData]);

  return (
    <div className="flex">
      <div className="flex-1 flex justify-between relative">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{ width: `${redCountRatio}%` }}
          transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
          className="h-[10px] absolute top-0 left-[-1px] rounded-[50px] bg-red-500"
        />

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{ width: `${blueCountRatio}%` }}
          transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
          className="h-[10px] absolute top-0 right-[-1px] rounded-[50px] bg-blue-500"
        />
      </div>
    </div>
  );
};

const VoteBox = () => {
  const { showModal: showPredictionModal } = useModalState('PREDICTION_VOTE');
  return (
    <div className="h-full flex justify-center items-center">
      <button
        onClick={showPredictionModal}
        className={clsx(
          'group relative text-center text-sm tracking-widest font-semibold text-neutral-700 bg-neutral-200 py-2 px-3 rounded-[50px] flex items-center'
        )}
      >
        <PredictionIcon />
        <span className="pl-6">勝敗予想</span>
      </button>
    </div>
  );
};

const PredictionIcon = () => {
  return (
    <>
      <motion.div
        className={clsx(
          'absolute top-[50%] left-[17px] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center rounded-[50%] w-6 h-6 text-neutral-200 bg-green-600 duration-100',
          'group-hover:w-7 group-hover:h-7 group-hover:bg-green-600/90'
        )}
      >
        <div className="text-sm">
          <MdHowToVote />
        </div>
      </motion.div>
    </>
  );
};
