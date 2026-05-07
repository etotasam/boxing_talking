import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Axios } from '@/api/axios';
import { API_PATH } from '@/constants/apiPath';
import { useFetchAllMatches } from '@/hooks/apiHooks/match';
import { createWrapper, match, matchesResponse } from './testUtils';

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

describe('useFetchAllMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('全試合一覧を取得して返す', async () => {
    vi.mocked(Axios.get).mockResolvedValueOnce(matchesResponse);

    const { result } = renderHook(() => useFetchAllMatches(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mocks.get).toHaveBeenCalledTimes(1);
      expect(mocks.get).toHaveBeenCalledWith(API_PATH.MATCH, { params: { range: 'all' } });
      expect(result.current.data).toEqual([match]);
      expect(result.current.isError).toBe(false);
    });
  });
});
