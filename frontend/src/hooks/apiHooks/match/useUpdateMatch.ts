import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useToastModal } from '@/hooks/useToastModal';
import type { MatchUpdateFormType } from '@/types';
import { useFetchAllMatches } from './useFetchAllMatches';
import { useFetchMatches } from './useFetchMatches';

type ArgumentType = Partial<MatchUpdateFormType> & { matchId: number };

export const useUpdateMatch = () => {
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { refetch: refetchMatches } = useFetchMatches();
  const { refetch: refetchAllMatches } = useFetchAllMatches();

  const api = useCallback(async (arg: ArgumentType) => {
    await Axios.patch(API_PATH.MATCH, arg);
  }, []);

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const updateMatch = (updateMatchData: ArgumentType) => {
    mutate(updateMatchData, {
      onSuccess: () => {
        refetchMatches();
        refetchAllMatches();
        hideFullScreenLoading();
        showSuccessToast(MESSAGE.MATCH_UPDATE_SUCCESS);
      },
      onError: () => {
        hideFullScreenLoading();
        showErrorToast(MESSAGE.MATCH_UPDATE_FAILED);
      },
      onSettled: () => {},
    });
  };

  return { updateMatch, isLoading, isSuccess };
};
