import { MatchDataType, MatchPredictionsType } from '@/types';
import { BoxersData } from './components/BoxersData';
import { Grade } from './components/Grade';
import { MatchMeta } from './components/MatchMeta';
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
          <Grade matchData={matchData} />
          <MatchMeta
            matchDate={matchData.matchDate}
            country={matchData.country}
            venue={matchData.venue}
          />
          <BoxersData matchData={matchData} />
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
