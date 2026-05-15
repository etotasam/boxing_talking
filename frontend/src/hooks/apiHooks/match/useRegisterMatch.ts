import { useMutation } from 'react-query';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';
import { useToastModal } from '@/hooks/useToastModal';
import type { RegisterMatchPropsType } from '@/types';
import { useFetchAllMatches } from './useFetchAllMatches';
import { useFetchMatches } from './useFetchMatches';

export const useRegisterMatch = () => {
  const { showErrorToast, showSuccessToast } = useToastModal();
  const { refetch: refetchMatches } = useFetchMatches();
  const { refetch: refetchAllMatches } = useFetchAllMatches();
  const { showFullScreenLoading, hideFullScreenLoading } = useFullScreenLoading();

  const api = async ({
    matchDate,
    redBoxerId,
    blueBoxerId,
    grade,
    country,
    venue,
    weight,
    titles,
  }: RegisterMatchPropsType) => {
    await Axios.post(API_PATH.MATCH, {
      matchDate,
      redBoxerId,
      blueBoxerId,
      grade,
      country,
      venue,
      weight,
      titles,
    });
  };

  const { mutate, isLoading, isSuccess } = useMutation(api, {
    onMutate: () => {
      showFullScreenLoading();
    },
  });

  const registerMatch = ({
    matchDate,
    redBoxerId,
    blueBoxerId,
    grade,
    country,
    venue,
    weight,
    titles,
  }: RegisterMatchPropsType) => {
    mutate(
      { matchDate, redBoxerId, blueBoxerId, grade, country, venue, weight, titles },
      {
        onSuccess: () => {
          refetchMatches();
          refetchAllMatches();
          hideFullScreenLoading();
          showSuccessToast(MESSAGE.MATCH_REGISTER_SUCCESS);
        },
        onError: () => {
          hideFullScreenLoading();
          showErrorToast(MESSAGE.MATCH_REGISTER_FAILED);
        },
      }
    );
  };

  return { registerMatch, isLoading, isSuccess };
};
