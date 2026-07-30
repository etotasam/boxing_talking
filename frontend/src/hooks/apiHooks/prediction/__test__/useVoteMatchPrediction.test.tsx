import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { useMatchPredictions, useVoteMatchPrediction } from '@/hooks/apiHooks/prediction';

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    refetchUsersPrediction: vi.fn(),
    showErrorToast: vi.fn(),
    showSuccessToast: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
      post: mocks.post,
    },
  };
});

vi.mock('@/hooks/useToastModal', () => {
  return {
    useToastModal: vi.fn(() => {
      return {
        showErrorToast: mocks.showErrorToast,
        showSuccessToast: mocks.showSuccessToast,
      };
    }),
  };
});

vi.mock('@/hooks/useFullScreenLoading', () => {
  return {
    useFullScreenLoading: vi.fn(() => {
      return {
        showFullScreenLoading: mocks.showFullScreenLoading,
        hideFullScreenLoading: mocks.hideFullScreenLoading,
      };
    }),
  };
});

vi.mock('@/hooks/apiHooks/prediction/useFetchUsersPrediction', () => {
  return {
    useFetchUsersPrediction: vi.fn(() => {
      return {
        data: [],
        refetch: mocks.refetchUsersPrediction,
        usePredictionFetchState: 'idle',
      };
    }),
  };
});

const noop = () => undefined;

setLogger({
  log: noop,
  warn: noop,
  error: noop,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useVoteMatchPrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('投票成功時にユーザー投票と試合別の総投票数を再取得する', async () => {
    const matchId = 10;
    vi.mocked(Axios.get)
      .mockResolvedValueOnce({
        data: { data: { isVisible: true, totalVotes: 1, red: 1, blue: 0 } },
      })
      .mockResolvedValueOnce({
        data: { data: { isVisible: true, totalVotes: 2, red: 2, blue: 0 } },
      });
    vi.mocked(Axios.post).mockResolvedValueOnce({ data: undefined });

    const { result } = renderHook(
      () => {
        return {
          matchPredictions: useMatchPredictions(matchId),
          vote: useVoteMatchPrediction(),
        };
      },
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.matchPredictions.data).toEqual({
        isVisible: true,
        totalVotes: 1,
        red: 1,
        blue: 0,
      });
    });

    act(() => {
      result.current.vote.matchVotePrediction({ matchId, prediction: 'red' });
    });

    await waitFor(() => {
      expect(result.current.matchPredictions.data).toEqual({
        isVisible: true,
        totalVotes: 2,
        red: 2,
        blue: 0,
      });
      expect(mocks.refetchUsersPrediction).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledTimes(2);
      expect(mocks.post).toHaveBeenCalledWith(API_PATH.PREDICTION, {
        matchId,
        prediction: 'red',
      });
      expect(mocks.showSuccessToast).toHaveBeenCalledWith(
        MESSAGE.SUCCESSFUL_VOTE_WIN_LOSS_PREDICTION
      );
    });
  });

  test('対象試合への投票状態が変わった時に集計結果を再取得する', async () => {
    const matchId = 10;
    vi.mocked(Axios.get)
      .mockResolvedValueOnce({
        data: {
          data: { isVisible: false, totalVotes: null, red: null, blue: null },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: { isVisible: true, totalVotes: 2, red: 1, blue: 1 },
        },
      });

    const { result, rerender } = renderHook(
      ({ userPrediction }: { userPrediction: 'red' | false }) =>
        useMatchPredictions(matchId, userPrediction),
      {
        initialProps: { userPrediction: false as 'red' | false },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.data?.isVisible).toBe(false);
    });

    rerender({ userPrediction: 'red' });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        isVisible: true,
        totalVotes: 2,
        red: 1,
        blue: 1,
      });
      expect(mocks.get).toHaveBeenCalledTimes(2);
    });
  });
});
