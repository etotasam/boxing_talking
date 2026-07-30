import { MatchDataType, MatchPredictionsType } from '@/types';
import { BoxersData } from './components/BoxersData';
import { Grade } from './components/Grade';
import { MatchMeta } from './components/MatchMeta';
import { PredictionSummary } from './components/PredictionSummary';
import { TaleOfTheTape } from './components/TaleOfTheTape';

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
        <div className="flex flex-col items-center relative w-full">
          <Grade matchData={matchData} />
          <MatchMeta
            matchDate={matchData.matchDate}
            country={matchData.country}
            venue={matchData.venue}
          />
          <BoxersData matchData={matchData} />
          <TaleOfTheTape
            redBoxer={matchData.redBoxer}
            blueBoxer={matchData.blueBoxer}
            matchDate={matchData.matchDate}
          />
          <PredictionSummary
            userPrediction={userPrediction}
            matchPredictions={matchPredictions}
            isLoading={isMatchPredictionsLoading}
            isShowVoteButton={isShowVoteButton}
            showPredictionModal={showPredictionModal}
          />
        </div>
      )}
    </>
  );
};
