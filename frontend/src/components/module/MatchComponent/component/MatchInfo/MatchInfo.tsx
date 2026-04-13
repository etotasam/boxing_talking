//! type
import { MatchDataType, MatchPredictionsType } from '@/types';
//! components
import { BoxersData } from './components/BoxersData';
import { Grade } from './components/Grade';
import { MatchDate, MatchVenue } from './components/MatchMeta';
import { PredictionSummary } from './components/PredictionSummary';

type MatchInfoPropsType = {
  matchData: MatchDataType;
  userPrediction?: 'red' | 'blue' | false;
  matchPredictions?: MatchPredictionsType;
  isMatchPredictionsLoading?: boolean;
  isShowVoteButton?: boolean;
  showPredictionModal?: () => void;
  className?: string;
};

export const MatchInfo = ({
  matchData,
  userPrediction,
  matchPredictions,
  isMatchPredictionsLoading = false,
  isShowVoteButton = false,
  showPredictionModal,
}: MatchInfoPropsType) => {
  return (
    <>
      {matchData && (
        <div className="flex flex-col items-center w-full relative">
          <BoxersData matchData={matchData} />
          <Grade matchData={matchData} />
          <div className="flex w-[80%] mt-5">
            <MatchDate matchDate={matchData.matchDate} />
            <MatchVenue country={matchData.country} venue={matchData.venue} />
          </div>
          <PredictionSummary
            userPrediction={userPrediction}
            matchPredictions={matchPredictions}
            isLoading={isMatchPredictionsLoading}
            redBoxerName={matchData.redBoxer.name}
            blueBoxerName={matchData.blueBoxer.name}
            isShowVoteButton={isShowVoteButton}
            showPredictionModal={showPredictionModal}
          />
        </div>
      )}
    </>
  );
};
