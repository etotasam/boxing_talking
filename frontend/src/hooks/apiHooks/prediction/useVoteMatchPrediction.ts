import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import type { AxiosResponse } from 'axios';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { QUERY_KEY } from '@/constants/queryKeys';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '../../useFullScreenLoading';
import { useToastModal } from '../../useToastModal';
import { useFetchUsersPrediction } from './useFetchUsersPrediction';

type PredictionErrorResponse = {
  message: string;
};

export const useVoteMatchPrediction = () => {
  const queryClient = useQueryClient();
  const { refetch: refetchAllFetchMatchPredictionOfAuthUser } = useFetchUsersPrediction();
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  type ApiPropsType = {
    matchId: number;
    prediction: 'red' | 'blue';
  };

  const api = useCallback(async ({ matchId, prediction }: ApiPropsType) => {
    await Axios.post(API_PATH.PREDICTION, {
      matchId: matchId,
      prediction,
    });
  }, []);
  const { mutate, isLoading: isMutateLoading, isSuccess: isMutateSuccess, isError } = useMutation<
    void,
    AxiosResponse<PredictionErrorResponse>,
    ApiPropsType
  >(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });
  const matchVotePrediction = ({ matchId, prediction }: ApiPropsType) => {
    mutate(
      { matchId, prediction },
      {
        onSettled: () => {
          hideFullScreenLoading();
        },
        onSuccess: (_, variables) => {
          refetchAllFetchMatchPredictionOfAuthUser();
          queryClient.invalidateQueries([QUERY_KEY.MATCH_PREDICTIONS, { id: variables.matchId }]);
          showSuccessToast(MESSAGE.SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION);
        },
        onError: (error: AxiosResponse<PredictionErrorResponse>) => {
          if (error.data.message === 'Cannot win-loss prediction after match date') {
            showErrorToast(MESSAGE.MATCH_IS_ALREADY_DONE);
            return;
          }
          if (error.data.message === 'Cannot win-loss prediction. You have already done.') {
            showErrorToast(MESSAGE.ALREADY_HAVE_DONE_VOTE);
            return;
          }
          showErrorToast(MESSAGE.FAILED_VOTE_WIN_LOSS_PREDICTION);
        },
      }
    );
  };

  const userPredictionPostState = isMutateLoading
    ? 'loading'
    : isMutateSuccess
      ? 'success'
      : isError
        ? 'error'
        : 'idle';

  return { matchVotePrediction, userPredictionPostState, isSuccess: isMutateSuccess, isError };
};
