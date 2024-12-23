import { useEffect } from 'react';
import { PredictionVoteModal } from './PredictionVoteModal';
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
  const { matchVotePrediction, isSuccess, isError } = useVoteMatchPrediction();
  //? 予想投票実行
  const voteExecution = (color: 'red' | 'blue') => {
    if (!thisMatch) return;
    //? 勝敗予想の投票
    matchVotePrediction({
      matchId: thisMatch.id,
      prediction: color,
    });
  };

  //? 投票が成功したら閉じる
  useEffect(() => {
    if (isSuccess || isError) {
      hideModal();
    }
  }, [isSuccess, isError]);

  //? 試合情報がない場合は何も表示させない
  if (!thisMatch) return;

  const handProps = {
    boxersData: {
      red: {
        name: thisMatch.redBoxer.name,
        country: thisMatch.redBoxer.country,
        title: thisMatch.redBoxer.titles.length,
      },
      blue: {
        name: thisMatch.blueBoxer.name,
        country: thisMatch.blueBoxer.country,
        title: thisMatch.blueBoxer.titles.length,
      },
    },
    voteExecution,
    close: hideModal,
  };

  return <PredictionVoteModal {...handProps} />;
};
