import React from 'react';
import clsx from 'clsx';
// ! types
import { NationalityType } from '@/assets/types';
// ! Nationaly
import { getNatinalFlag } from '@/assets/NationalFlagData';

type PropsType = React.ComponentProps<'div'> & { nationaly: NationalityType };

export const FlagImage = ({ nationaly, className }: PropsType) => {
  return (
    <>
      <div className={clsx(className)}>
        <img
          className="w-full h-full object-cover"
          src={getNatinalFlag(nationaly)}
          alt={nationaly}
        />
      </div>
    </>
  );
};
