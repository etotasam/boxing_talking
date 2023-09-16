// import React from "react";
import { FlagImage } from '@/components/atomc/FlagImage';

import { NationalityType } from '@/assets/types';

export const EngNameWithFlag = ({
  boxerCountry,
  boxerEngName,
}: {
  boxerCountry: NationalityType;
  boxerEngName: string;
}) => {
  return (
    <div className="sm:flex sm:items-center sm:justify-center w-full sm:text-sm text-[12px] text-gray-600">
      <div className="flex justify-center">
        <div className="relative flex justify-center overflow-hidden border-[1px] border-black/20 w-[18px] h-[18px] sm:mr-1 rounded-[50%]">
          <FlagImage
            className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[20px] h-[18px] sm:mr-2 mb-1"
            nationaly={boxerCountry}
          />
        </div>
      </div>
      <p className="text-center">{boxerEngName}</p>
    </div>
  );
};
