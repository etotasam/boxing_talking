import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useToastModal } from '@/hooks/useToastModal';
import { useFetchAllMatches } from './useFetchAllMatches';
import { useFetchMatches } from './useFetchMatches';

export const useDeleteMatch = () => {
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();
  const { refetch: refetchMatches } = useFetchMatches();
  const { refetch: refetchAllMatches } = useFetchAllMatches();

  const api = useCallback(async (matchId: number) => {
    await Axios.delete(API_PATH.MATCH, { data: { matchId } });
  }, []);

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const deleteMatch = (matchId: number) => {
    mutate(matchId, {
      onSuccess: () => {
        refetchMatches();
        refetchAllMatches();
        hideFullScreenLoading();
        showSuccessToast(MESSAGE.MATCH_DELETED);
      },
      onError: () => {
        hideFullScreenLoading();
        showErrorToast(MESSAGE.MATCH_DELETE_FAILED);
      },
    });
  };

  return { deleteMatch, isLoading, isSuccess };
};
