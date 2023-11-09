import React from 'react';
import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { BoxerInfo } from '@/components/module/BoxerInfo';
import { BoxerType } from '@/assets/types';

export const BoxerInfoModal = ({
  boxerData,
  onClick,
}: {
  boxerData: BoxerType | undefined;
  onClick: () => void;
}) => {
  if (boxerData === undefined) return;

  return (
    <>
      <ClearFullScreenDiv className="bg-black/50 z-30 flex justify-center items-center">
        <div
          onClick={onClick}
          className="max-w-[400px] w-[95%] h-auto bg-white rounded-sm flex justify-center items-center cursor-pointer"
        >
          <BoxerInfo boxer={boxerData} className="py-10 px-5" />
        </div>
      </ClearFullScreenDiv>
    </>
  );
};
