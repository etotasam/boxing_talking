import React from 'react';
import clsx from 'clsx';
// ! types
import { NationalityType } from '@/assets/types';
// ! Nationally
import { getNationalFlag } from '@/assets/NationalFlagData';

type PropsType = React.ComponentProps<'div'> & { nationality: NationalityType };

export const FlagImage = ({ nationality, className }: PropsType) => {
  return (
    <>
      <span className={clsx(className)}>
        <img
          className="w-full h-full object-cover"
          src={getNationalFlag(nationality)}
          alt={nationality}
        />
      </span>
    </>
  );
};
