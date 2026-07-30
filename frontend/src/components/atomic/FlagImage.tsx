import React from 'react';
import clsx from 'clsx';
import { CountryType } from '@/types';
import { getNationalFlag } from '@/utils/nationalFlag';

type PropsType = React.ComponentProps<'span'> & {
  nationality: CountryType;
};

export const FlagImage = ({ nationality, className }: PropsType) => {
  const NationalFlag = getNationalFlag(nationality);

  return (
    <span className={clsx(className)}>
      <NationalFlag
        aria-label={nationality}
        className="h-full w-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        role="img"
      />
    </span>
  );
};
