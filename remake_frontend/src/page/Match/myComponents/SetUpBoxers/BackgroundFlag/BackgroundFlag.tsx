import React from 'react';
import clsx from 'clsx';
// ! types
import { NationalityType } from '@/assets/types';
// ! Nationaly
import { Nationality } from '@/assets/NationalFlagData';
// ! Flags
import japanFlag from '@/assets/images/flags/japan.svg';
import usaFlag from '@/assets/images/flags/usa.svg';
import philpinFlag from '@/assets/images/flags/philpin.svg';
import mexicoFlag from '@/assets/images/flags/mexico.svg';
import kazakhstanFlag from '@/assets/images/flags/kz.svg';
import ukFlag from '@/assets/images/flags/uk.svg';
import rusiaFlag from '@/assets/images/flags/rusia.svg';
import ukrineFlag from '@/assets/images/flags/ukrine.svg';
import southAfricaFlag from '@/assets/images/flags/southafrica.svg';

type PropsType = React.ComponentProps<'div'> & {
  nationaly: NationalityType;
  thisMatchPredictionOfUsers?:
    | 'red'
    | 'blue'
    | 'No prediction vote'
    | undefined;
};

export const BackgroundFlag = ({
  nationaly,
  thisMatchPredictionOfUsers = undefined,
  children,
}: PropsType) => {
  const getNatinalFlag = (country: NationalityType) => {
    if (country == Nationality.Japan) return japanFlag;
    if (country == Nationality.Philpin) return philpinFlag;
    if (country == Nationality.USA) return usaFlag;
    if (country == Nationality.Mexico) return mexicoFlag;
    if (country == Nationality.Kazakhstan) return kazakhstanFlag;
    if (country == Nationality.UK) return ukFlag;
    if (country == Nationality.Rusia) return rusiaFlag;
    if (country == Nationality.Ukrine) return ukrineFlag;
    if (country == Nationality.SouthAfrica) return southAfricaFlag;
  };

  const formatPosition = (country: NationalityType) => {
    if (country == Nationality.UK) return '25% 30%';
    if (country == Nationality.Rusia) return '25% 75%';
    if (country == Nationality.SouthAfrica) return '25% 30%';
    if (country == Nationality.Mexico) return '25% 40%';
    return 'center';
  };

  return (
    <>
      <div
        className={'flex-1 py-5 absolute top-0 left-0 w-full h-full'}
        style={{
          backgroundImage: `url(${getNatinalFlag(nationaly)})`,
          backgroundSize: 'cover',
          backgroundPosition: `${formatPosition(nationaly)}`,
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
