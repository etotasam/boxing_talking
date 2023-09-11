// import React from "react";
import { FlagImage } from "@/components/atomc/FlagImage";

import { NationalityType } from "@/assets/types";

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
        <FlagImage
          className="w-[24px] h-[16px] border-[1px] sm:mr-2 mb-1"
          nationaly={boxerCountry}
        />
      </div>
      <p className="text-center">{boxerEngName}</p>
    </div>
  );
};
