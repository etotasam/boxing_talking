import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
//! context
import {
  IsThisMatchAfterTodayType,
  ThisMatchPredictionByUserType,
} from '../..';
//! type
import { MatchDataType, BoxerType } from '@/assets/types';
//! hooks
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/apiHooks/uesWinLossPrediction';
//! icon
import { MdHowToVote } from 'react-icons/md';
//! components
import { BackgroundFlag } from './BackgroundFlag';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';

type BoxersPropsType = {
  thisMatch: MatchDataType | undefined;
  showBoxerInfoModal: (boxerColor: 'red' | 'blue') => void;
  showPredictionVoteModal: () => void;
  device: 'PC' | 'SP' | undefined;
  isFetchCommentsLoading: boolean;
  thisMatchPredictionByUser: ThisMatchPredictionByUserType;
  isThisMatchAfterToday: IsThisMatchAfterTodayType;
};
export const Boxers = (props: BoxersPropsType) => {
  const {
    thisMatch,
    isFetchCommentsLoading, //? コメントの取得状態
    thisMatchPredictionByUser, //? この試合へのuserの勝敗予想
    isThisMatchAfterToday, //? 試合日が未来かどうか
    showPredictionVoteModal, //? 勝敗予想投票モーダルの表示
  } = props;

  //? userがこの試合への勝敗予想をいているかどうか
  const isVotePrediction = Boolean(
    thisMatchPredictionByUser ?? thisMatchPredictionByUser !== undefined
  );

  const thisMatchPredictionCount = {
    redCount: thisMatch?.count_red ?? 0,
    blueCount: thisMatch?.count_blue ?? 0,
    totalCount: (thisMatch?.count_red ?? 0) + (thisMatch?.count_blue ?? 0),
  };

  //? 勝敗予想数を数から%に変換する関数
  const formatPredictionCountToPercent = (predictionCount: number) => {
    const percent = Math.round(
      (predictionCount / thisMatchPredictionCount.totalCount) * 100
    );
    if (!isNaN(percent)) {
      return percent;
    } else {
      return 0;
    }
  };

  //? 投票Barを表示させる条件
  const isShowPredictionBar =
    props.device &&
    props.device === 'SP' &&
    !isFetchCommentsLoading &&
    isVotePrediction;

  //? 投票ボタン表示条件
  const isShowVoteButton = isThisMatchAfterToday && !isVotePrediction;

  if (!thisMatch) return;
  return (
    <>
      <div
        className={clsx(
          'flex border-b-[1px] border-stone-300 min-h-[65px]',
          props.device === 'PC' && 'relative',
          props.device === 'SP' && 'sticky top-0'
        )}
      >
        {isShowVoteButton && (
          //? 投票ボタン
          <VotesButton showPredictionVoteModal={showPredictionVoteModal} />
        )}
        <div className="z-10 bg-white/20 backdrop-blur-sm absolute top-0 left-0 w-full h-full" />
        <BoxerBox
          boxer={thisMatch.red_boxer}
          onClick={() => props.showBoxerInfoModal('red')}
        />
        <BoxerBox
          boxer={thisMatch.blue_boxer}
          onClick={() => props.showBoxerInfoModal('blue')}
        />
        {/* //? 投票数bar */}
        {isShowPredictionBar && (
          <>
            <motion.span
              initial={{
                width: 0,
              }}
              animate={{
                width: `${formatPredictionCountToPercent(
                  thisMatchPredictionCount.redCount
                )}%`,
              }}
              transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
              className="z-20 block absolute bottom-0 left-0 bg-red-600 h-1"
            />
            <motion.span
              initial={{
                width: 0,
              }}
              animate={{
                width: `${formatPredictionCountToPercent(
                  thisMatchPredictionCount.blueCount
                )}%`,
              }}
              transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
              className="z-20 block absolute bottom-0 right-0 bg-blue-600 h-1"
            />
          </>
        )}
      </div>
    </>
  );
};

type VoteButtonType = React.ComponentProps<'button'> & {
  showPredictionVoteModal: () => void;
};
const VotesButton = ({ showPredictionVoteModal }: VoteButtonType) => {
  const {
    isRefetching: isRefetchingAllMatchPrediction,
    isLoading: isLoadingAllMatchPrediction,
  } = useAllFetchMatchPredictionOfAuthUser();

  const handleClick = () => {
    if (isRefetchingAllMatchPrediction || isLoadingAllMatchPrediction) return;
    showPredictionVoteModal();
  };
  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
        className="z-30 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:w-[50px] sm:h-[50px] w-[40px] h-[40px] bg-green-600 hover:bg-green-600/80 rounded-[50%] flex justify-center items-center text-white text-[20px] hover:text-[25px] duration-200"
      >
        <MdHowToVote />
      </motion.button>
    </AnimatePresence>
  );
};

type BoxerBoxType = {
  boxer: BoxerType;
  onClick: () => void;
};
const BoxerBox = ({ boxer, onClick }: BoxerBoxType) => {
  return (
    <div onClick={onClick} className={clsx('flex-1 py-5 relative')}>
      <BackgroundFlag nationality={boxer.country}>
        <div
          className={
            'z-20 select-none absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full flex flex-col justify-center items-center'
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
