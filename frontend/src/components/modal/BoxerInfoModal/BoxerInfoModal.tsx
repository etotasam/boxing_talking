import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { BoxerInfo } from '@/components/module/BoxerInfo';
import { useRecoilState } from 'recoil';
import { boxerInfoDataState } from '@/store/boxerInfoDataState';
import { useModalState } from '@/hooks/useModalState';

export const BoxerInfoModal = () => {
  const [boxerInfoData] = useRecoilState(boxerInfoDataState);
  const { hideModal } = useModalState('BOXER_INFO');

  return (
    <>
      <ClearFullScreenDiv className="bg-black/50 z-30 flex justify-center items-center">
        <div
          onClick={hideModal}
          className="max-w-[400px] w-[95%] h-auto bg-white rounded-sm flex justify-center items-center cursor-pointer"
        >
          <BoxerInfo boxer={boxerInfoData} className="py-10 px-5" />
        </div>
      </ClearFullScreenDiv>
    </>
  );
};
