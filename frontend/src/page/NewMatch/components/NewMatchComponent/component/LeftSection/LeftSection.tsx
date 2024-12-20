import { ReactNode } from 'react';
import clsx from 'clsx';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
//! types
import { MatchDataType } from '@/assets/types';
// ! components
import { BoxerName } from './component/BoxerName';
import { MatchInfoBox } from './component/MatchInfoBox';
import { MatchResultBox } from './component/MatchResultBox';
import { PredictionsBox } from './component/PredictionBox';
//! image
import leftImg from '@/assets/images/etc/leftImg.jpg';
import black_grove from '@/assets/images/etc/black_grove.jpg';

type LeftSectionType = {
  matchData: MatchDataType | undefined;
};

export const LeftSection = ({ matchData }: LeftSectionType) => {
  //?試合データを取得するまでは何もrenderさせない

  const isTitleMatch = matchData?.grade === 'タイトルマッチ';

  if (!matchData) return;
  return (
    <LeftSectionWrapper>
      <div className="flex justify-center w-full">
        <div className=" z-10 w-full">
          <BoxerName matchData={matchData} />
          <PredictionsBox matchDate={matchData.matchDate} />
          <div className={clsx('relative w-full flex justify-center text-stone-200')}>
            <MatchInfoBox matchData={matchData} />
          </div>

          {matchData.result && <MatchResultBox matchData={matchData} />}
        </div>
      </div>
    </LeftSectionWrapper>
  );
};

type LeftSectionWrapperType = {
  children: ReactNode;
};
const LeftSectionWrapper = (props: LeftSectionWrapperType) => {
  const { children } = props;

  //? headerの高さを取得
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  return (
    <div
      className={clsx('justify-center w-full h-[100vh] overflow-auto')}
      style={{
        paddingTop: `${headerHeight}px`,
        backgroundImage: `url(${black_grove})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="fixed top-0 backdrop-blur-sm bg-neutral-900/80 w-[30%] h-full border-neutral-800 border-r-[1px]" />
      {children}
    </div>
  );
};
