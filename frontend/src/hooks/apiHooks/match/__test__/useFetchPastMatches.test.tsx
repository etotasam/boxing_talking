import { act, renderHook, waitFor } from '@testing-library/react';
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

  test('取得失敗後もローディングを閉じ、再取得に成功できる', async () => {
    mocks.get
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(matchesResponse);
    const { result } = renderHook(() => useFetchPastMatches(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.data).toEqual([match]));
    expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(2);
    expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(2);
  });

  test('キャッシュが有効な状態で再マウントしても取得やローディングを開始しない', async () => {
    mocks.get.mockResolvedValueOnce(matchesResponse);
    const wrapper = createWrapper();
    const first = renderHook(() => useFetchPastMatches(), { wrapper });
    await waitFor(() => expect(first.result.current.data).toEqual([match]));
    first.unmount();

    const second = renderHook(() => useFetchPastMatches(), { wrapper });
    expect(second.result.current.data).toEqual([match]);
    expect(mocks.get).toHaveBeenCalledTimes(1);
    expect(mocks.showFullScreenLoading).toHaveBeenCalledTimes(1);
    expect(mocks.hideFullScreenLoading).toHaveBeenCalledTimes(1);
  });
});
