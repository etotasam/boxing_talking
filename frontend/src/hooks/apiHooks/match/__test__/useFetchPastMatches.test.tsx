import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useFetchPastMatches } from '@/hooks/apiHooks/match';
import { createWrapper, match, matchesResponse } from './testUtils';

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
    showFullScreenLoading: vi.fn(),
    hideFullScreenLoading: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
    },
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

describe('useFetchPastMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('過去試合一覧を取得し、取得中ローディングを閉じる', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(matchesResponse);

    const { result } = renderHook(() => useFetchPastMatches(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.MATCH, { params: { range: 'past' } });
      expect(result.current.data).toEqual([match]);
      expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
    });
  });
});
