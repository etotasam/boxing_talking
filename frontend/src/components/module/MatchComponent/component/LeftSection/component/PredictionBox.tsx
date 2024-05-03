import { useContext, useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
//! type
import { MatchPredictionsType } from '@/assets/types';
//! context
import {
  UsersPredictionContext,
  // IsThisMatchAfterTodayContext,
  MatchPredictionsContext,
} from '@/components/module/MatchComponent/MatchContainer';
//! hooks
import { useModalState } from '@/hooks/useModalState';
import { useDayOfFightChecker } from '@/hooks/useDayOfFightChecker';
//! icon
import { MdHowToVote } from 'react-icons/md';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchDataState } from '@/store/apiFetchDataState';

type PropsType = {
  matchDate: string;
};
export const PredictionsBox = (props: PropsType) => {
  const { matchDate } = props;
  //? この試合へのuserの勝敗予想をcontextから取得
  const usersPrediction = useContext(UsersPredictionContext);

  //? userがこの試合への勝敗予想は投票済みかどうか
  const isVoted = usersPrediction === 'red' || usersPrediction === 'blue';
  const isNotVoted = usersPrediction === false;

  //? userが投票中…
  const isPostingPrediction = useRecoilValue(
    apiFetchDataState({ dataName: 'userPrediction/post', state: 'isLoading' })
  );

  //? userの投票成功？
  const isSuccessPrediction = useRecoilValue(
    apiFetchDataState({ dataName: 'userPrediction/post', state: 'isSuccess' })
  );

  //? 試合予想投票数の初期取得中…
  const isMatchPredictionLoading = useRecoilValue(
    apiFetchDataState({ dataName: 'matchPrediction/fetch', state: 'isLoading' })
  );

  //? 試合日が未来かどうか
  const { isDayAfterFight, isDayOnFight, isDayBeforeFight } = useDayOfFightChecker(matchDate);

  //? 試合予想数
  const matchPredictions = useContext(MatchPredictionsContext);

  //? 予想投票数などを表示する条件
  const isShowPredictionBox =
    (isVoted && !isMatchPredictionLoading) || (isDayAfterFight && !isDayOnFight);

  const isShowVoteBox =
    isNotVoted && isDayBeforeFight && !isDayOnFight && !isPostingPrediction && !isSuccessPrediction;

  return (
    <>
      <div className="h-[35px] my-2">
        {isShowPredictionBox ? (
          <PredictionBox matchPredictions={matchPredictions!} />
        ) : (
          isShowVoteBox && <VoteBox />
        )}
      </div>
    </>
  );
};

const PredictionBox = ({ matchPredictions }: { matchPredictions: MatchPredictionsType }) => {
  return (
    <div className="flex justify-center">
      <div className="w-[95%]">
        <PredictionBar matchPredictions={matchPredictions} />
      </div>
    </div>
  );
};

type PredictionBarType = {
  matchPredictions: MatchPredictionsType;
};
const PredictionBar = (props: PredictionBarType) => {
  const { matchPredictions } = props;

  const usersPrediction = useContext(UsersPredictionContext);

  const [redCountRatio, setRedCountRatio] = useState<number>(0);
  const [blueCountRatio, setBlueCountRatio] = useState<number>(0);

  const makeWinPredictionRate = (): void => {
    if (!matchPredictions) return;
    const totalCount = matchPredictions.totalVotes;
    const redRatio = Math.round((matchPredictions.red / totalCount) * 1000) / 10;
    setRedCountRatio(!isNaN(redRatio) ? redRatio : 0);
    const blueRatio = Math.round((matchPredictions.blue / totalCount) * 1000) / 10;
    setBlueCountRatio(!isNaN(blueRatio) ? blueRatio : 0);
  };

  //? コメント取得中かどうか(first fetch)
  const isFetchingComments = useRecoilValue(
    apiFetchDataState({ dataName: 'comments/fetch', state: 'isLoading' })
  );

  useEffect(() => {
    if (!matchPredictions) return;
    if (isFetchingComments) return;
    makeWinPredictionRate();
  }, [matchPredictions, isFetchingComments]);

  if (usersPrediction === undefined) return;
  if (!matchPredictions) return;

  return (
    <div className="flex">
      <div className="flex-1 flex justify-between relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${redCountRatio}%` }}
          transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
          className="h-[25px] absolute top-0 left-[-1px] rounded-sm bg-red-800"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className={clsx(
              'text-[26px] absolute bottom-[5px] left-3',
              usersPrediction === 'red' ? 'text-yellow-400 font-bold' : 'text-stone-300'
            )}
          >
            {matchPredictions.red}
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${blueCountRatio}%` }}
          transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
          className="h-[25px] absolute top-0 right-[-1px] rounded-sm bg-blue-800"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className={clsx(
              'text-[26px] absolute bottom-[5px] right-3',
              usersPrediction === 'blue' ? 'text-yellow-400 font-bold' : 'text-stone-300'
            )}
          >
            {matchPredictions.blue}
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};

const VoteBox = () => {
  const { showModal: showPredictionModal } = useModalState('PREDICTION_VOTE');
  return (
    <div className="flex justify-center items-center px-2">
      <button
        onClick={showPredictionModal}
        className={clsx(
          'group relative w-full text-center text-sm tracking-widest font-semibold text-neutral-700 bg-neutral-200 py-2 rounded-md flex justify-center items-center'
        )}
      >
        <span className="relative">
          <PredictionIcon />
          <span className="">勝敗予想</span>
        </span>
      </button>
    </div>
  );
};

const PredictionIcon = () => {
  return (
    <>
      <motion.span
        className={clsx(
          'inline-block absolute top-[50%] left-[-13px] translate-x-[-50%] translate-y-[-50%] text-[18px] group-hover:text-[22px] duration-200'
        )}
      >
        <MdHowToVote />
      </motion.span>
    </>
  );
};
