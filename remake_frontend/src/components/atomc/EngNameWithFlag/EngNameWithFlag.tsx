import React from "react";
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
    <div className="flex items-center justify-center w-full text-sm text-gray-600">
      <FlagImage
        className="w-[24px] h-[16px] border-[1px] mr-2"
        nationaly={boxerCountry}
      />
      <p>{boxerEngName}</p>
    </div>
  );
};
