import React, { useContext } from 'react';
import clsx from 'clsx';
// ! types
import { NationalityType } from '@/assets/types';
import { getNationalFlag, formatPosition } from '@/assets/NationalFlagData';
//! context
import {
  ThisMatchPredictionByUserContext,
  IsThisMatchAfterTodayContext,
} from '../../..';

type BackgroundFlagPropsType = React.ComponentProps<'div'> & {
  nationality: NationalityType;
};

export const BackgroundFlag = ({
  nationality,
  children,
}: BackgroundFlagPropsType) => {
  //? この試合へのuserの勝敗予想をcontextから取得
  const thisMatchPredictionByUser = useContext(
    ThisMatchPredictionByUserContext
  );

  //? 試合日が未来かどうか
  const isThisMatchAfterToday = useContext(IsThisMatchAfterTodayContext);
  //? 試合日が未来or過去の情報取得完了までは表示させない
  if (isThisMatchAfterToday === undefined) return;

  return (
    <>
      <div
        className={'flex-1 py-5 absolute top-0 left-0 w-full h-full'}
        style={{
          backgroundImage: `url(${getNationalFlag(nationality)})`,
          backgroundSize: 'cover',
          backgroundPosition: `${formatPosition(nationality)}`,
        }}
      >
        <div
          className={clsx(
            'absolute top-0 left-0 w-full h-full bg-white duration-500',
            thisMatchPredictionByUser === false &&
              'bg-white/100 hover:bg-white/80',
            (thisMatchPredictionByUser === 'red' ||
              thisMatchPredictionByUser === 'blue') &&
              'bg-white/80',
            !isThisMatchAfterToday && 'bg-white/80'
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
};
