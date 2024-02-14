import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { MatchInfo } from '@/components/module/MatchInfo';
import { MatchDataType } from '@/assets/types';
import { useModalState } from '@/hooks/useModalState';
import { useWindowSize } from '@/hooks/useWindowSize';

export const MatchInfoModal = ({
  matchData,
}: {
  matchData: MatchDataType | undefined;
}) => {
  const { hideModal } = useModalState('MATCH_INFO');
  const { device } = useWindowSize();
  if (matchData === undefined) return;

  if (device === 'PC') {
    hideModal;
  }

  return (
    <>
      <ClearFullScreenDiv className="bg-black/50 z-30 flex justify-center items-center">
        <div
          onClick={hideModal}
          className="max-w-[400px] w-[95%] h-auto py-10 bg-white rounded-sm flex justify-center items-center cursor-pointer"
        >
          <MatchInfo matchData={matchData} />
        </div>
      </ClearFullScreenDiv>
    </>
  );
};
