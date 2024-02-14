import { ReactNode } from 'react';
import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';

type InfoModalType = {
  onClick: () => void;
  children: ReactNode;
};

export const InfoModal = (props: InfoModalType) => {
  const { onClick, children } = props;

  return (
    <>
      <ClearFullScreenDiv className="bg-black/50 z-30 flex justify-center items-center">
        <div
          onClick={onClick}
          className="max-w-[400px] w-[95%] h-auto py-10 bg-white rounded-sm flex justify-center items-center cursor-pointer"
        >
          {children}
        </div>
      </ClearFullScreenDiv>
    </>
  );
};
