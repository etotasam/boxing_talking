import { PredictionVoteModal } from '.';
import { MatchDataType } from '@/assets/types';
import { useVoteMatchPrediction } from '@/hooks/apiHooks/uesWinLossPrediction';
import { useModalState } from '@/hooks/useModalState';

type PropsType = {
  thisMatch: MatchDataType | undefined;
};
export const PredictionVoteModalContainer = (props: PropsType) => {
  const { thisMatch } = props;
  //? 勝敗予想投票モーダルのstate
  const { hideModal } = useModalState('PREDICTION_VOTE');
  //? 勝敗予想の投票hook
  const { matchVotePrediction } = useVoteMatchPrediction();
  //? 予想投票実行
  const voteExecution = (color: 'red' | 'blue') => {
    if (!thisMatch) return;
    //? 勝敗予想の投票
    matchVotePrediction({
      matchID: thisMatch.id,
      prediction: color,
    });
    hideModal();
  };
  if (!thisMatch) return;
  return (
    <PredictionVoteModal
      thisMatch={thisMatch}
      voteExecution={voteExecution}
      cancel={hideModal}
    />
  );
};
