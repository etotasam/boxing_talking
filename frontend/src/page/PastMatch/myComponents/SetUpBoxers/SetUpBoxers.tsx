import { motion } from 'framer-motion';
import clsx from 'clsx';
//! types
import { BoxerType, MatchDataType } from '@/assets/types';
//! components
import { BackgroundFlag } from './BackgroundFlag';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { useEffect, useRef } from 'react';
import { useMatchBoxerSectionHeight } from '@/hooks/useMatchBoxerSectionHeight';
import { MatchInfoModal } from '@/components/modal/MatchInfoModal';
//! hook
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
};

export const SetUpBoxers = ({
  thisMatch,
  thisMatchPredictionOfUsers,
  thisMatchPredictionCount,
  isFetchingComments,
}: SetUpBoxersType) => {
  //? use hook
  const { setter: setMatchBoxerSectionHeight } = useMatchBoxerSectionHeight();
  const { device } = useWindowSize();
  const boxerSectionRef = useRef<HTMLElement>(null);
  const { state: isShowMatchInfoModal, hideMatchInfoModal } =
    useMatchInfoModal();

  //? コンポーネントの高さをRecoilに保存
  useEffect(() => {
    if (boxerSectionRef.current)
      setMatchBoxerSectionHeight(boxerSectionRef.current.clientHeight);
  }, [boxerSectionRef.current]);

  //?勝敗予想投票数を%(比率)にする
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

  const isShowPredictionBar =
    device &&
    device === 'SP' &&
    !isFetchingComments &&
    (thisMatchPredictionOfUsers === 'red' ||
      thisMatchPredictionOfUsers === 'blue');

  return (
    <>
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
            'z-20 flex border-b-[1px] border-stone-300 sm:h-[100px] h-[75px]',
            device === 'PC' && 'relative',
            device === 'SP' && 'sticky top-0'
          )}
        >
          <BoxerBox
            color="red"
            boxerData={thisMatch.red_boxer}
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
          />
          <BoxerBox
            color="blue"
            boxerData={thisMatch.blue_boxer}
            thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
          />
          {/* //? 投票数bar */}
          {isShowPredictionBar && (
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
    </>
  );
};

type BoxerBoxType = {
  boxerData: BoxerType;
  color: 'red' | 'blue';
  thisMatchPredictionOfUsers: 'red' | 'blue' | 'No prediction vote' | undefined;
};

const BoxerBox = ({ boxerData, thisMatchPredictionOfUsers }: BoxerBoxType) => {
  return (
    <div className={clsx('flex-1 py-5 relative')}>
      <BackgroundFlag
        nationality={boxerData.country}
        thisMatchPredictionOfUsers={thisMatchPredictionOfUsers}
      >
        <div
          className={
            'select-none absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full flex flex-col justify-center items-center'
          }
        >
          <EngNameWithFlag
            boxerCountry={boxerData.country}
            boxerEngName={boxerData.eng_name}
          />
          <h2
            className={clsx(
              boxerData.name.length > 7
                ? `sm:text-[18px] text-[12px]`
                : `sm:text-[20px] text-[16px]`
            )}
          >
            {boxerData.name}
          </h2>
        </div>
      </BackgroundFlag>
    </div>
  );
};
