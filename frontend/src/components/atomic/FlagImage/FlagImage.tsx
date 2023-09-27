import React from 'react';
import clsx from 'clsx';
// ! types
import { NationalityType } from '@/assets/types';
// ! Nationaly
import { getNationalFlag } from '@/assets/NationalFlagData';

type PropsType = React.ComponentProps<'div'> & { nationality: NationalityType };

export const FlagImage = ({ nationality, className }: PropsType) => {
  return (
    <>
      <div className={clsx(className)}>
        <img
          className="w-full h-full object-cover"
          src={getNationalFlag(nationality)}
          alt={nationality}
        />
      </div>
    </>
  );
};
