import React from 'react';
import clsx from 'clsx';
import { CountryType } from '@/types';
import { getNationalFlag } from '@/utils/nationalFlag';

type PropsType = React.ComponentProps<'div'> & {
  nationality: CountryType;
};

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
