import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useFetchMatchById } from '@/hooks/apiHooks/match';
import { createWrapper, match, singleMatchResponse } from './testUtils';

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn(),
  };
});

vi.mock('@/api/axios', () => {
  return {
    Axios: {
      get: mocks.get,
    },
  };
});

describe('useFetchMatchById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('指定した試合 ID の試合情報を取得して返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(singleMatchResponse);

    const { result } = renderHook(() => useFetchMatchById(match.id), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(`${API_PATH.MATCH}/${match.id}/show`);
      expect(result.current.data).toEqual(match);
      expect(result.current.isError).toBe(false);
    });
  });
});
