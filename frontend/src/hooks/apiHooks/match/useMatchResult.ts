import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useToastModal } from '@/hooks/useToastModal';
import type { MatchResultType } from '@/types';
import { useFetchAllMatches } from './useFetchAllMatches';
import { useFetchMatches } from './useFetchMatches';

//! 試合結果の登録
export const useMatchResult = () => {
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { refetch: refetchMatches } = useFetchMatches();
  const { refetch: refetchAllMatches } = useFetchAllMatches();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();

  const api = async (resultData: MatchResultType) => {
    await Axios.post(API_PATH.MATCH_RESULT, resultData);
  };

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const storeMatchResult = ({
    isUpdateBoxerRecordChecked,
    matchId,
    result,
    detail,
    round,
  }: MatchResultType) => {
    mutate(
      { isUpdateBoxerRecordChecked, matchId, result, detail, round },
      {
        onSuccess: () => {
          refetchMatches();
          refetchAllMatches();
          hideFullScreenLoading();
          showSuccessToast(MESSAGE.MATCH_RESULT_STORED);
        },
        onError: () => {
          hideFullScreenLoading();
          showErrorToast(MESSAGE.MATCH_RESULT_STORE_FAILED);
        },
      }
    );
  };

  return { storeMatchResult, isLoading, isSuccess };
};
