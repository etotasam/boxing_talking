import { useContext, useState, useEffect } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
//! type
import { MatchDataType, MatchPredictionsType } from '@/assets/types';
//! context
import {
  ThisMatchPredictionByUserContext,
  IsThisMatchAfterTodayContext,
  MatchPredictionsContext,
} from '@/components/module/MatchComponent/MatchContainer';
//! hooks
import { useModalState } from '@/hooks/useModalState';
//! icon
import { MdHowToVote } from 'react-icons/md';
//! recoil
import { useRecoilValue } from 'recoil';
import { apiFetchDataState } from '@/store/apiFetchDataState';

export const PredictionsBox = ({ matchData }: { matchData: MatchDataType | undefined }) => {
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionOfUser = useContext(ThisMatchPredictionByUserContext);

  //? userがこの試合への勝敗予想は投票済みかどうか
  const isVoted =
    thisMatchPredictionOfUser !== undefined &&
    (thisMatchPredictionOfUser === 'red' || thisMatchPredictionOfUser === 'blue');

  //? userが投票中…
  const isPostingPrediction = useRecoilValue(
    apiFetchDataState({ dataName: 'userPrediction/post', state: 'isLoading' })
  );

  //? ユーザーの予想のリフェッチ中…
  const isPredictionRefetching = useRecoilValue(
    apiFetchDataState({ dataName: 'userPrediction/fetch', state: 'isFetching' })
  );

  //? 試合予想投票数の初期取得中…
  const isMatchPredictionLoading = useRecoilValue(
    apiFetchDataState({ dataName: 'matchPrediction/fetch', state: 'isLoading' })
  );

  //? 試合日が未来かどうか
  const isThisMatchAfterToday = useContext(IsThisMatchAfterTodayContext);

  //? 試合予想数
  const matchPredictions = useContext(MatchPredictionsContext);

  //? 勝敗予想投票数の表示条件
  const isShowPredictionBar =
    (isVoted || isThisMatchAfterToday === false) && matchPredictions && !!matchData;

  //? 予想投票数などを表示する条件
  const isShowPredictionBox =
    (!!matchData && isVoted && !isMatchPredictionLoading) || !isThisMatchAfterToday;

  const isShowVoteBox = thisMatchPredictionOfUser === false;

  return (
    <>
      <div className="h-[25px] my-2">
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
  const thisMatchPredictionOfUser = useContext(ThisMatchPredictionByUserContext);

  const [redCountRatio, setRedCountRatio] = useState<number>(0);
  const [blueCountRatio, setBlueCountRatio] = useState<number>(0);

  const setWinPredictionRate = (): void => {
    if (!matchPredictions) return;
    const totalCount = matchPredictions.totalVotes;
    const redRatio = Math.round((matchPredictions.red / totalCount) * 1000) / 10;
    setRedCountRatio(!isNaN(redRatio) ? redRatio : 0);
    const blueRatio = Math.round((matchPredictions.blue / totalCount) * 1000) / 10;
    setBlueCountRatio(!isNaN(blueRatio) ? blueRatio : 0);
  };

  useEffect(() => {
    if (!matchPredictions) return;
    setWinPredictionRate();
  }, [matchPredictions]);

  if (!thisMatchPredictionOfUser) return;
  if (!matchPredictions) return;

  return (
    <div className="flex">
      <div className="flex-1 flex justify-between relative">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{ width: `${redCountRatio}%` }}
          transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
          className="h-[25px] absolute top-0 left-[-1px] rounded-sm bg-red-800"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
            className={clsx(
              'text-[26px] absolute bottom-[5px] left-3',
              thisMatchPredictionOfUser === 'red' ? 'text-yellow-400 font-bold' : 'text-stone-300'
            )}
          >
            {matchPredictions.red}
          </motion.span>
        </motion.div>

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{ width: `${blueCountRatio}%` }}
          transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
          className="h-[25px] absolute top-0 right-[-1px] rounded-sm bg-blue-800"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.5 }}
            className={clsx(
              'text-[26px] absolute bottom-[5px] right-3',
              thisMatchPredictionOfUser === 'blue' ? 'text-yellow-400 font-bold' : 'text-stone-300'
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
