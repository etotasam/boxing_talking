import React from 'react';
import clsx from 'clsx';
// ! types
import { NationalityType } from '@/assets/types';
import { getNationalFlag, formatPosition } from '@/assets/NationalFlagData';

type PropsType = React.ComponentProps<'div'> & {
  nationality: NationalityType;
  thisMatchPredictionOfUsers?:
    | 'red'
    | 'blue'
    | 'No prediction vote'
    | undefined;
};

export const BackgroundFlag = ({
  nationality,
  thisMatchPredictionOfUsers = undefined,
  children,
}: PropsType) => {
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
            thisMatchPredictionOfUsers === 'No prediction vote' &&
              'bg-white/100 hover:bg-white/80',
            (thisMatchPredictionOfUsers === 'red' ||
              thisMatchPredictionOfUsers === 'blue') &&
              'bg-white/80'
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
};
