import { useState, useEffect, useRef, useContext, ReactNode } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! types
import { MatchDataType } from '@/assets/types';
// ! components
import { MatchInfo } from '@/components/module/MatchInfo';
//! hooks
import { useFetchComments } from '@/hooks/apiHooks/useComment';
//! context
import {
  ThisMatchPredictionByUserContext,
  IsThisMatchAfterTodayContext,
} from '../../MatchContainer';

type LeftSectionType = {
  thisMatch: MatchDataType | undefined;
  commentPostEl: HTMLSelectElement | null;
};

export const LeftSection = ({ thisMatch, commentPostEl }: LeftSectionType) => {
  //?試合データを取得するまでは何もrenderさせない
  if (!thisMatch) return;
  return (
    <LeftSectionWrapper commentPostEl={commentPostEl}>
      <div className="flex justify-center">
        <MatchInfo matchData={thisMatch} />
      </div>

      <PredictionsBarBox thisMatch={thisMatch} />
    </LeftSectionWrapper>
  );
};

const PredictionsBarBox = ({
  thisMatch,
}: {
  thisMatch: MatchDataType | undefined;
}) => {
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionOfUser = useContext(
    ThisMatchPredictionByUserContext
  );

  //? userがこの試合への勝敗予想は投票済みかどうか
  const isVotedMatchPrediction =
    thisMatchPredictionOfUser === 'red' || thisMatchPredictionOfUser === 'blue';

  //? 試合日が未来かどうか
  const isThisMatchAfterToday = useContext(IsThisMatchAfterTodayContext);

  //? 勝敗予想投票数の表示条件
  const isShowPredictionBar = isVotedMatchPrediction || !isThisMatchAfterToday;

  const { isSuccess: isFetchCommentsSuccess } = useFetchComments(thisMatch!.id);

  if (!isShowPredictionBar) return;
  if (!thisMatch) return;
  return (
    <>
      <div className="flex justify-center mb-5">
        <div className="w-[80%]">
          <PredictionBox
            thisMatch={thisMatch}
            isFetchCommentsSuccess={isFetchCommentsSuccess}
          />
        </div>
      </div>
    </>
  );
};

type PredictionBoxType = {
  isFetchCommentsSuccess: boolean;
  thisMatch: MatchDataType;
};
const PredictionBox = (props: PredictionBoxType) => {
  const { isFetchCommentsSuccess, thisMatch } = props;
  if (!isFetchCommentsSuccess) return;
  return (
    <>
      <UsersPredictionVoteDestination thisMatch={thisMatch} />
      <PredictionVoteCount thisMatch={thisMatch} />
      <PredictionBar thisMatch={thisMatch} />
    </>
  );
};

const UsersPredictionVoteDestination = ({
  thisMatch,
}: {
  thisMatch: MatchDataType;
}) => {
  const thisMatchPredictionOfUser = useContext(
    ThisMatchPredictionByUserContext
  );
  if (!thisMatchPredictionOfUser) return;
  return (
    <p className="text-center lg:text-sm text-xs font-light">
      <span
        className={clsx(
          'relative',
          'after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:border-b-[1px] after:border-stone-600 after:w-[115%]'
        )}
      >
        {thisMatchPredictionOfUser === 'red' &&
          `${thisMatch.red_boxer.name}の勝利に投票しました`}
        {thisMatchPredictionOfUser === 'blue' &&
          `${thisMatch.blue_boxer.name}の勝利に投票しました`}
      </span>
    </p>
  );
};

const PredictionVoteCount = ({ thisMatch }: { thisMatch: MatchDataType }) => {
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionOfUser = useContext(
    ThisMatchPredictionByUserContext
  );

  return (
    <div className="flex justify-between mt-5">
      <span
        className={clsx(
          'block pl-3 text-lg font-semibold right-0 top-0',
          "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1",
          thisMatchPredictionOfUser === 'red' && 'text-red-600'
        )}
      >
        {thisMatch.count_red}
      </span>
      {
        <span
          className={clsx(
            'block text-right pr-3 text-lg font-semibold right-0 top-0',
            "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1",
            thisMatchPredictionOfUser === 'blue' && 'text-blue-600'
          )}
        >
          {thisMatch.count_blue}
        </span>
      }
    </div>
  );
};

type PredictionBarType = {
  thisMatch: MatchDataType;
};
const PredictionBar = (props: PredictionBarType) => {
  const { thisMatch } = props;

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
    <div className="flex mt-0">
      <div className="flex-1 flex justify-between relative">
        <motion.div
          initial={{
            width: 0,
          }}
          animate={{ width: `${redCountRatio}%` }}
          transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
          className="h-[10px] absolute top-0 left-[-1px] rounded-[50px] bg-red-700"
        />

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{ width: `${blueCountRatio}%` }}
          transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
          className="h-[10px] absolute top-0 right-[-1px] rounded-[50px] bg-blue-700"
        />
      </div>
    </div>
  );
};

type LeftSectionWrapperType = {
  commentPostEl: HTMLSelectElement | null;
  children: ReactNode;
};
const LeftSectionWrapper = (props: LeftSectionWrapperType) => {
  const { commentPostEl, children } = props;
  const leftSectionRef = useRef(null);
  //? headerの高さを取得(Recoil)
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  //? state, hooks
  const [isLeftSectionHigherThenMainEl, setIsLeftSectionHigherThenMainEl] =
    useState<boolean | undefined>(undefined);
  const [stickyTopPosition, setStickyTopPosition] = useState(0);

  //? LeftSectionコンポーネントの高さをuseState`setIsLeftSectionHigherThenMainEl`にセット
  const checkElementsHeight = (): void => {
    if (!headerHeight) return;
    if (!commentPostEl) return;
    if (!leftSectionRef.current) return;

    const leftSectionHeight = (
      leftSectionRef.current as unknown as HTMLDivElement
    ).clientHeight;

    const mainElHeight =
      window.innerHeight - (headerHeight + commentPostEl.clientHeight);

    setIsLeftSectionHigherThenMainEl(leftSectionHeight > mainElHeight);

    if (!(leftSectionHeight > mainElHeight)) return;

    const topPosition = -(
      leftSectionHeight -
      (window.innerHeight - commentPostEl.clientHeight)
    );
    setStickyTopPosition(topPosition);
  };

  useEffect(() => {
    if (!leftSectionRef.current) return;
    checkElementsHeight();
    window.addEventListener('scroll', checkElementsHeight);
  }, [leftSectionRef.current]);

  return (
    <div className="z-10 xl:w-[30%] w-[40%] bg-white">
      <div
        ref={leftSectionRef}
        className={clsx('flex justify-center')}
        style={{
          position: 'sticky',
          top: `${
            isLeftSectionHigherThenMainEl ? stickyTopPosition : headerHeight
          }px`,
          marginBottom: `${commentPostEl?.clientHeight ?? '0'}px`,
        }}
      >
        <div className="w-full max-w-[450px] bg-white">{children}</div>
      </div>
    </div>
  );
};
