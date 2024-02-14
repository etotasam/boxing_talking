import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { getNationalFlag, formatPosition } from '@/assets/NationalFlagData';
//! context
import {
  IsThisMatchAfterTodayType,
  ThisMatchPredictionByUserType,
} from '../..';
//! type
import { MatchDataType, BoxerType, NationalityType } from '@/assets/types';
//! hooks
import { useAllFetchMatchPredictionOfAuthUser } from '@/hooks/apiHooks/uesWinLossPrediction';
//! icon
import { MdHowToVote } from 'react-icons/md';
//! components
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';

type BoxersPropsType = {
  boxersRef: React.MutableRefObject<null>;
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
    boxersRef,
    device,
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

  //? 投票Barを表示させる条件
  const isShowPredictionBar =
    device && device === 'SP' && !isFetchCommentsLoading && isVotePrediction;

  //? 投票ボタン表示条件
  const isShowVoteButton = isThisMatchAfterToday && !isVotePrediction;

  if (!thisMatch) return;
  return (
    <>
      <div
        ref={boxersRef}
        className={clsx(
          'flex border-b-[1px] border-stone-300 min-h-[65px]',
          device === 'PC' && 'relative',
          device === 'SP' && 'sticky top-0'
        )}
      >
        {isShowVoteButton && (
          //? 投票ボタン
          <VotesButton showPredictionVoteModal={showPredictionVoteModal} />
        )}
        <NationalFlagBackgroundDiv
          countries={{
            Aside: thisMatch.red_boxer.country,
            Bside: thisMatch.blue_boxer.country,
          }}
        >
          <BoxerBox
            boxer={thisMatch.red_boxer}
            onClick={() => props.showBoxerInfoModal('red')}
          />
          <BoxerBox
            boxer={thisMatch.blue_boxer}
            onClick={() => props.showBoxerInfoModal('blue')}
          />
        </NationalFlagBackgroundDiv>
        {/* //? 投票数bar */}
        {isShowPredictionBar && <PredictionBar thisMatch={thisMatch} />}
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
    <div onClick={onClick} className={clsx('flex-1 relative h-[65px]')}>
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
    </div>
  );
};

const PredictionBar = ({ thisMatch }: { thisMatch: MatchDataType }) => {
  //? 勝敗予想数を数から%に変換する関数
  const formatPredictionCountToPercent = (predictionCount: number) => {
    const totalVoteCount = thisMatch.count_red + thisMatch.count_blue;
    const percent = Math.round((predictionCount / totalVoteCount) * 100);
    if (!isNaN(percent)) {
      return percent;
    } else {
      return 0;
    }
  };

  const redRatio = formatPredictionCountToPercent(thisMatch.count_red);
  const blueRatio = formatPredictionCountToPercent(thisMatch.count_blue);

  return (
    <>
      <motion.span
        initial={{
          width: 0,
        }}
        animate={{
          width: `${redRatio}%`,
        }}
        transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
        className="z-20 block absolute bottom-0 left-0 bg-red-600 h-1"
      />
      <motion.span
        initial={{
          width: 0,
        }}
        animate={{
          width: `${blueRatio}%`,
        }}
        transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
        className="z-20 block absolute bottom-0 right-0 bg-blue-600 h-1"
      />
    </>
  );
};

type NationalFlagBackgroundDivPropsType = {
  countries: { Aside: NationalityType; Bside: NationalityType };
  children?: React.ReactNode;
};
export const NationalFlagBackgroundDiv = ({
  countries,
  children,
}: NationalFlagBackgroundDivPropsType) => {
  const sameCountry = countries.Aside === countries.Bside;

  if (sameCountry)
    return <SameCountry countries={countries} children={children} />;
  return <Default countries={countries} children={children} />;
};

const Default = (props: NationalFlagBackgroundDivPropsType) => {
  const { countries, children } = props;
  const aSideBgUrl = getNationalFlag(countries.Aside);
  const bSideBgUrl = getNationalFlag(countries.Bside);
  const aSidePosition = formatPosition(countries.Aside);
  const bSidePosition = formatPosition(countries.Bside);
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute left-0 w-1/2 h-full"
        style={{
          backgroundImage: `url(${aSideBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: aSidePosition,
        }}
      />
      <div
        className="absolute right-0 w-1/2 h-full"
        style={{
          backgroundImage: `url(${bSideBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: bSidePosition,
        }}
      />
      <div className="bg-white/50 w-full h-full flex backdrop-blur-[2px]">
        {children}
      </div>
    </div>
  );
};

const SameCountry = (props: NationalFlagBackgroundDivPropsType) => {
  const { countries, children } = props;
  const bgUrl = getNationalFlag(countries.Aside);
  const position = formatPosition(countries.Aside);
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: position,
      }}
    >
      <div className="bg-white/50 w-full h-full flex backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};
