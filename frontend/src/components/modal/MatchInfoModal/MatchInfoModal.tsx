import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { MatchInfo } from '@/components/module/MatchInfo';
import { MatchDataType } from '@/assets/types';
import { useModalState } from '@/hooks/useModalState';

export const MatchInfoModal = ({
  matchData,
}: {
  matchData: MatchDataType | undefined;
}) => {
  const { hideModal } = useModalState('MATCH_INFO');
  if (matchData === undefined) return;

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
