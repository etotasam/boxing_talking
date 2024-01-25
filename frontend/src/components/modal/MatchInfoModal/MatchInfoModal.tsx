import { ClearFullScreenDiv } from '@/components/atomic/ClearFullScreenDiv';
import { MatchInfo } from '@/components/module/MatchInfo';
import { MatchDataType } from '@/assets/types';

export const MatchInfoModal = ({
  matchData,
  onClick,
}: {
  matchData: MatchDataType | undefined;
  onClick: () => void;
}) => {
  if (matchData === undefined) return;

  return (
    <>
      <ClearFullScreenDiv className="bg-black/50 z-30 flex justify-center items-center">
        <div
          onClick={onClick}
          className="max-w-[400px] w-[95%] h-auto py-10 bg-white rounded-sm flex justify-center items-center cursor-pointer"
        >
          <MatchInfo matchData={matchData} />
        </div>
      </ClearFullScreenDiv>
    </>
  );
};
